"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Calculation = {
  id: string;
  grossSalary: number;
  cas: number;
  cass: number;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
  createdAt?: unknown;
};

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCalculations(uid: string) {
    const q = query(collection(db, "users", uid, "calculations"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setCalculations(snapshot.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as Omit<Calculation, "id">) })));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) await loadCalculations(currentUser.uid);
      else setCalculations([]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleDelete(calcId: string) {
    if (!user) return;
    if (!window.confirm("Sigur vrei să ștergi acest calcul?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "calculations", calcId));
      await loadCalculations(user.uid);
      alert("Calcul șters");
    } catch {
      alert("Eroare la ștergere");
    }
  }

  if (loading) return <main className="app-shell p-8">Se încarcă...</main>;

  if (!user) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <section className="auth-card">
          <h1 className="text-3xl font-bold">Istoric calcule</h1>
          <p className="mt-4 text-white/70">Trebuie să fii autentificat.</p>
          <Link href="/login" className="primary-btn mt-6 inline-block">Mergi la Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell p-6 md:p-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)]">
        <h1 className="text-4xl font-bold">Istoric calcule</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push("/");
            }}
            className="secondary-btn"
          >
            Înapoi
          </button>
          <Link href="/" className="secondary-btn inline-block">Home</Link>
        </div>

        {calculations.length === 0 ? (
          <p className="mt-6 text-white/75">Nu ai calcule salvate.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {calculations.map((calc) => (
              <div key={calc.id} className="rounded-[24px] border border-white/10 bg-[#071326]/80 p-4">
                <p><strong>Brut:</strong> {calc.grossSalary.toFixed(2)} RON</p>
                <p className="mt-2"><strong>CAS:</strong> {calc.cas.toFixed(2)} RON</p>
                <p className="mt-2"><strong>CASS:</strong> {calc.cass.toFixed(2)} RON</p>
                <p className="mt-2"><strong>Bază impozabilă:</strong> {calc.taxableIncome.toFixed(2)} RON</p>
                <p className="mt-2"><strong>Impozit:</strong> {calc.incomeTax.toFixed(2)} RON</p>
                <p className="mt-2 text-lg font-bold"><strong>Net:</strong> {calc.netSalary.toFixed(2)} RON</p>
                <button onClick={() => handleDelete(calc.id)} className="secondary-btn mt-4 w-full">Șterge calcul</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
