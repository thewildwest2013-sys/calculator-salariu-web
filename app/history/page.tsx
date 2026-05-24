"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  mealTickets?: number;
  totalEstimated?: number;
  overtimeExtra?: number;
  nightExtra?: number;
  weekendExtra?: number;
  holidayExtra?: number;
  createdAt?: unknown;
};

function money(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} RON`;
}

function formatDate(value: unknown) {
  if (!value) return "Dată necunoscută";

  try {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number };
    const date = typeof maybeTimestamp.toDate === "function"
      ? maybeTimestamp.toDate()
      : typeof maybeTimestamp.seconds === "number"
        ? new Date(maybeTimestamp.seconds * 1000)
        : value instanceof Date
          ? value
          : new Date(String(value));

    if (Number.isNaN(date.getTime())) return "Dată necunoscută";

    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Dată necunoscută";
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);

  const totalSaved = useMemo(
    () => calculations.reduce((sum, calc) => sum + (calc.totalEstimated ?? calc.netSalary ?? 0), 0),
    [calculations],
  );

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

  function exportCalculation(calc: Calculation) {
    const html = `
      <html>
        <head>
          <title>Calcul salariu</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            h1 { margin-bottom: 6px; }
            .muted { color: #6b7280; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 14px; }
            .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
            .value { font-size: 20px; font-weight: 700; margin-top: 6px; }
          </style>
        </head>
        <body>
          <h1>Raport calcul salariu</h1>
          <div class="muted">${formatDate(calc.createdAt)}</div>
          <div class="grid">
            <div class="card"><div class="label">Brut</div><div class="value">${money(calc.grossSalary)}</div></div>
            <div class="card"><div class="label">Net</div><div class="value">${money(calc.netSalary)}</div></div>
            <div class="card"><div class="label">Meal vouchers</div><div class="value">${money(calc.mealTickets)}</div></div>
            <div class="card"><div class="label">Total estimat</div><div class="value">${money(calc.totalEstimated ?? calc.netSalary)}</div></div>
            <div class="card"><div class="label">CAS</div><div class="value">${money(calc.cas)}</div></div>
            <div class="card"><div class="label">CASS</div><div class="value">${money(calc.cass)}</div></div>
            <div class="card"><div class="label">Impozit</div><div class="value">${money(calc.incomeTax)}</div></div>
            <div class="card"><div class="label">Bază impozabilă</div><div class="value">${money(calc.taxableIncome)}</div></div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Browserul a blocat fereastra de export.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  if (loading) return <main className="app-shell p-8 text-white">Se încarcă...</main>;

  if (!user) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <section className="auth-card max-w-xl">
          <h1 className="text-3xl font-bold">Calculation history</h1>
          <p className="mt-4 text-white/70">Trebuie să fii autentificat.</p>
          <Link href="/login" className="primary-btn mt-6 inline-block">Mergi la Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell p-6 md:p-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">History personal</div>
            <h1 className="mt-2 text-4xl font-bold">Calculation history</h1>
            <p className="mt-3 max-w-2xl text-white/65">
              Saved calculations from the app appear here. You can quickly export a PDF report using your browser print function.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/");
              }}
              className="secondary-btn"
            >
              Back
            </button>
            <Link href="/" className="secondary-btn inline-block">Home</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-[#071326]/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Calcule salvate</div>
            <div className="mt-2 text-3xl font-bold">{calculations.length}</div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-[#071326]/80 p-4 md:col-span-2">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Total estimat salvat</div>
            <div className="mt-2 break-words text-3xl font-bold">{money(totalSaved)}</div>
          </div>
        </div>

        {calculations.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-[#071326]/80 p-6 text-white/75">
            You do not have saved calculations yet. After making a calculation, go to Details and press “Save calculation”.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {calculations.map((calc) => (
              <div key={calc.id} className="rounded-[26px] border border-white/10 bg-[#071326]/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">{formatDate(calc.createdAt)}</div>
                <div className="mt-3 text-2xl font-bold text-emerald-300">{money(calc.netSalary)}</div>
                <div className="mt-1 text-sm text-white/55">Net estimat</div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Brut" value={money(calc.grossSalary)} />
                  <Detail label="Meal vouchers" value={money(calc.mealTickets)} />
                  <Detail label="Total" value={money(calc.totalEstimated ?? calc.netSalary)} />
                  <Detail label="Impozit" value={money(calc.incomeTax)} />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => exportCalculation(calc)} className="primary-btn flex-1">Export PDF</button>
                  <button onClick={() => handleDelete(calc.id)} className="secondary-btn flex-1">Șterge</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1 break-words font-semibold text-white/85">{value}</div>
    </div>
  );
}
