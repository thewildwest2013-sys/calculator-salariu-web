"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getSavedLang, type Lang } from "@/lib/i18n";

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

type HistoryText = {
  loading: string;
  dateUnknown: string;
  title: string;
  kicker: string;
  description: string;
  loginNeeded: string;
  goLogin: string;
  back: string;
  home: string;
  savedCount: string;
  savedTotal: string;
  empty: string;
  confirmDelete: string;
  deleted: string;
  deleteError: string;
  popupBlocked: string;
  reportTitle: string;
  gross: string;
  net: string;
  mealTickets: string;
  totalEstimated: string;
  tax: string;
  taxableBase: string;
  estimatedNet: string;
  exportPdf: string;
  delete: string;
};

const TEXT: Record<Lang, HistoryText> = {
  ro: {
    loading: "Se încarcă...",
    dateUnknown: "Dată necunoscută",
    title: "Istoric calcule",
    kicker: "Istoric personal",
    description:
      "Aici apar calculele salvate din aplicație. Poți exporta rapid un raport PDF folosind funcția de printare a browserului.",
    loginNeeded: "Trebuie să fii autentificat.",
    goLogin: "Mergi la Login",
    back: "Înapoi",
    home: "Acasă",
    savedCount: "Calcule salvate",
    savedTotal: "Total estimat salvat",
    empty: "Nu ai calcule salvate încă. După ce faci un calcul, intră la Estimare și salvează calculul.",
    confirmDelete: "Sigur vrei să ștergi acest calcul?",
    deleted: "Calcul șters",
    deleteError: "Eroare la ștergere",
    popupBlocked: "Browserul a blocat fereastra de export.",
    reportTitle: "Raport calcul salariu",
    gross: "Brut",
    net: "Net",
    mealTickets: "Tichete masă",
    totalEstimated: "Total estimat",
    tax: "Impozit",
    taxableBase: "Bază impozabilă",
    estimatedNet: "Net estimat",
    exportPdf: "Export PDF",
    delete: "Șterge",
  },
  en: {
    loading: "Loading...",
    dateUnknown: "Unknown date",
    title: "Calculation history",
    kicker: "Personal history",
    description:
      "Saved calculations from the app appear here. You can quickly export a PDF report using your browser print function.",
    loginNeeded: "You need to be signed in.",
    goLogin: "Go to Login",
    back: "Back",
    home: "Home",
    savedCount: "Saved calculations",
    savedTotal: "Saved estimated total",
    empty: "You do not have saved calculations yet. After making a calculation, go to Estimate and save the calculation.",
    confirmDelete: "Are you sure you want to delete this calculation?",
    deleted: "Calculation deleted",
    deleteError: "Delete error",
    popupBlocked: "The browser blocked the export window.",
    reportTitle: "Salary calculation report",
    gross: "Gross",
    net: "Net",
    mealTickets: "Meal tickets",
    totalEstimated: "Estimated total",
    tax: "Tax",
    taxableBase: "Taxable base",
    estimatedNet: "Estimated net",
    exportPdf: "Export PDF",
    delete: "Delete",
  },
};

function useSavedLang() {
  const [lang, setLang] = useState<Lang>("ro");

  useEffect(() => {
    const readLang = () => setLang(getSavedLang());

    readLang();
    window.addEventListener("storage", readLang);
    window.addEventListener("calculator-salariu-lang-change", readLang);

    return () => {
      window.removeEventListener("storage", readLang);
      window.removeEventListener("calculator-salariu-lang-change", readLang);
    };
  }, []);

  return lang;
}

function money(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} RON`;
}

function formatDate(value: unknown, lang: Lang, fallback: string) {
  if (!value) return fallback;

  try {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number };
    const date = typeof maybeTimestamp.toDate === "function"
      ? maybeTimestamp.toDate()
      : typeof maybeTimestamp.seconds === "number"
        ? new Date(maybeTimestamp.seconds * 1000)
        : value instanceof Date
          ? value
          : new Date(String(value));

    if (Number.isNaN(date.getTime())) return fallback;

    return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return fallback;
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const lang = useSavedLang();
  const t = TEXT[lang];
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
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "calculations", calcId));
      await loadCalculations(user.uid);
      alert(t.deleted);
    } catch {
      alert(t.deleteError);
    }
  }

  function exportCalculation(calc: Calculation) {
    const html = `
      <html>
        <head>
          <title>${t.reportTitle}</title>
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
          <h1>${t.reportTitle}</h1>
          <div class="muted">${formatDate(calc.createdAt, lang, t.dateUnknown)}</div>
          <div class="grid">
            <div class="card"><div class="label">${t.gross}</div><div class="value">${money(calc.grossSalary)}</div></div>
            <div class="card"><div class="label">${t.net}</div><div class="value">${money(calc.netSalary)}</div></div>
            <div class="card"><div class="label">${t.mealTickets}</div><div class="value">${money(calc.mealTickets)}</div></div>
            <div class="card"><div class="label">${t.totalEstimated}</div><div class="value">${money(calc.totalEstimated ?? calc.netSalary)}</div></div>
            <div class="card"><div class="label">CAS</div><div class="value">${money(calc.cas)}</div></div>
            <div class="card"><div class="label">CASS</div><div class="value">${money(calc.cass)}</div></div>
            <div class="card"><div class="label">${t.tax}</div><div class="value">${money(calc.incomeTax)}</div></div>
            <div class="card"><div class="label">${t.taxableBase}</div><div class="value">${money(calc.taxableIncome)}</div></div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(t.popupBlocked);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  if (loading) return <main className="app-shell p-8 text-white">{t.loading}</main>;

  if (!user) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <section className="auth-card max-w-xl">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="mt-4 text-white/70">{t.loginNeeded}</p>
          <Link href="/login" className="primary-btn mt-6 inline-block">{t.goLogin}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell p-6 md:p-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">{t.kicker}</div>
            <h1 className="mt-2 text-4xl font-bold">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-white/65">
              {t.description}
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
              {t.back}
            </button>
            <Link href="/" className="secondary-btn inline-block">{t.home}</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-[#071326]/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">{t.savedCount}</div>
            <div className="mt-2 text-3xl font-bold">{calculations.length}</div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-[#071326]/80 p-4 md:col-span-2">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">{t.savedTotal}</div>
            <div className="mt-2 break-words text-3xl font-bold">{money(totalSaved)}</div>
          </div>
        </div>

        {calculations.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-[#071326]/80 p-6 text-white/75">
            {t.empty}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {calculations.map((calc) => (
              <div key={calc.id} className="rounded-[26px] border border-white/10 bg-[#071326]/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">{formatDate(calc.createdAt, lang, t.dateUnknown)}</div>
                <div className="mt-3 text-2xl font-bold text-emerald-300">{money(calc.netSalary)}</div>
                <div className="mt-1 text-sm text-white/55">{t.estimatedNet}</div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <Detail label={t.gross} value={money(calc.grossSalary)} />
                  <Detail label={t.mealTickets} value={money(calc.mealTickets)} />
                  <Detail label="Total" value={money(calc.totalEstimated ?? calc.netSalary)} />
                  <Detail label={t.tax} value={money(calc.incomeTax)} />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => exportCalculation(calc)} className="primary-btn flex-1">{t.exportPdf}</button>
                  <button onClick={() => handleDelete(calc.id)} className="secondary-btn flex-1">{t.delete}</button>
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
