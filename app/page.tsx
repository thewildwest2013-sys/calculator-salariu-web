"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
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
  const [user, setUser] = useState<User | null>(null);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCalculations(uid: string) {
    const q = query(
      collection(db, "users", uid, "calculations"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const items: Calculation[] = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...(docItem.data() as Omit<Calculation, "id">),
    }));

    setCalculations(items);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadCalculations(currentUser.uid);
      } else {
        setCalculations([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleDelete(calcId: string) {
    if (!user) return;

    const confirmDelete = window.confirm(
      "Sigur vrei să ștergi acest calcul?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "calculations", calcId));
      await loadCalculations(user.uid);
      alert("Calcul șters");
    } catch (error) {
      alert("Eroare la ștergere");
    }
  }

  if (loading) {
    return (
      <main className="p-10 text-white">
        <h1 className="text-3xl font-bold">Istoric calcule</h1>
        <p className="mt-4">Se încarcă...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-10 text-white">
        <h1 className="text-3xl font-bold">Istoric calcule</h1>
        <p className="mt-4">Trebuie să fii autentificat.</p>
        <Link href="/login" className="mt-4 inline-block border p-3 rounded">
          Mergi la Login
        </Link>
      </main>
    );
  }

  return (
    <main className="p-10 text-white max-w-3xl">
      <h1 className="text-3xl font-bold">Istoric calcule</h1>

      <Link href="/" className="mt-4 inline-block border p-3 rounded">
        Înapoi la Home
      </Link>

      {calculations.length === 0 ? (
        <p className="mt-6">Nu ai calcule salvate.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {calculations.map((calc) => (
            <div key={calc.id} className="border rounded p-4">
              <p>
                <strong>Brut:</strong> {calc.grossSalary.toFixed(2)} RON
              </p>
              <p className="mt-2">
                <strong>CAS:</strong> {calc.cas.toFixed(2)} RON
              </p>
              <p className="mt-2">
                <strong>CASS:</strong> {calc.cass.toFixed(2)} RON
              </p>
              <p className="mt-2">
                <strong>Bază impozabilă:</strong> {calc.taxableIncome.toFixed(2)}{" "}
                RON
              </p>
              <p className="mt-2">
                <strong>Impozit:</strong> {calc.incomeTax.toFixed(2)} RON
              </p>
              <p className="mt-2 text-lg font-bold">
                <strong>Net:</strong> {calc.netSalary.toFixed(2)} RON
              </p>

              <button
                onClick={() => handleDelete(calc.id)}
                className="mt-4 border p-3 rounded w-full"
              >
                Șterge calcul
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}