"use client";

import { useEffect, useState } from "react";

type Lang = "ro" | "en";

function usePageLang() {
  const [lang, setLang] = useState<Lang>("ro");
  useEffect(() => {
    const readLang = () => {
      const saved =
        localStorage.getItem("calculator-salariu-lang") ||
        localStorage.getItem("lang") ||
        localStorage.getItem("language");
      if (saved === "en" || saved === "ro") setLang(saved);
    };
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

export default function Page() {
  const lang = usePageLang();

  const t = {
    ro: {
      label: "Ghid salarizare România",
      title: "Ghid salariu 2026",
      subtitle:
        "Tot ce trebuie să știi despre calculul salariului net, contribuțiile obligatorii, sporuri și venitul lunar în România în 2026.",
      sections: [
        {
          title: "Contribuțiile obligatorii în 2026",
          body: "În România, din salariul brut se rețin trei contribuții principale: CAS (contribuția la pensie) de 25% din brut, CASS (contribuția la sănătate) de 10% din brut și impozitul pe venit de 10% aplicat la baza impozabilă. De exemplu, pentru un salariu brut de 5.000 lei: CAS = 1.250 lei, CASS = 500 lei, baza impozabilă = 3.250 lei, impozit = 325 lei, salariu net estimat = 2.925 lei.",
        },
        {
          title: "Salariul minim brut 2026",
          body: "Salariul minim brut garantat în plată în România pentru 2026 este de 4.050 lei. Aceasta înseamnă un salariu net estimat de aproximativ 2.363 lei, după deducerea CAS (1.012,5 lei), CASS (405 lei) și impozit (270 lei aproximativ). Angajații din construcții sau agricultură pot beneficia de regimuri fiscale diferite.",
        },
        {
          title: "Cum folosești calculatorul",
          body: "Introdu salariul brut în câmpul dedicat din pagina Reguli. Completează procentele de sporuri (noapte, weekend, sărbători) conform contractului tău. Marchează zilele lucrate în calendar selectând tipul turei: Morning, After, Night, Vacation sau Medical. Calculatorul actualizează în timp real netul estimat, bonurile de masă și sporurile.",
        },
        {
          title: "Ce influențează salariul net",
          body: "Salariul net final depinde de: salariul brut din contract, numărul de zile lucrate, tipul turelor (noapte, weekend, sărbători), bonurile de masă (valoarea maximă neimpozabilă per zi este reglementată anual), concediile medicale (plătite diferit față de zilele lucrate normal), orele suplimentare și eventualele deduceri personale aplicabile.",
        },
        {
          title: "Deducerea personală de bază",
          body: "Angajații cu venituri mici pot beneficia de deducere personală, care reduce baza de impozitare. Deducerea se acordă în funcție de venitul brut lunar și numărul de persoane în întreținere. Verifică cu angajatorul sau contabilul dacă ești eligibil, deoarece aplicarea ei poate crește salariul net cu câteva sute de lei lunar.",
        },
        {
          title: "De ce estimarea diferă de fluturaș",
          body: "Calculatorul oferă o estimare orientativă. Fluturașul real poate diferi din cauza: reținerilor executorești, primelor acordate sau reținute, regularizărilor de impozit, zilelor de concediu medical (unde procentul din bază diferă față de zilele lucrate), și regulilor interne ale angajatorului privind cumulul sporurilor.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Salary guide 2026",
      subtitle:
        "Everything you need to know about net salary calculation, mandatory contributions, bonuses and monthly income in Romania in 2026.",
      sections: [
        {
          title: "Mandatory contributions in 2026",
          body: "In Romania, three main contributions are deducted from gross salary: CAS (pension contribution) at 25% of gross, CASS (health contribution) at 10% of gross, and income tax at 10% applied to the taxable base. For example, for a 5,000 RON gross salary: CAS = 1,250 RON, CASS = 500 RON, taxable base = 3,250 RON, income tax = 325 RON, estimated net salary = 2,925 RON.",
        },
        {
          title: "Minimum gross wage 2026",
          body: "The guaranteed minimum gross wage in Romania for 2026 is 4,050 RON. This means an estimated net salary of approximately 2,363 RON, after deducting CAS (1,012.5 RON), CASS (405 RON) and income tax (approximately 270 RON). Employees in construction or agriculture may benefit from different tax regimes.",
        },
        {
          title: "How to use the calculator",
          body: "Enter the gross salary in the dedicated field on the Rules page. Fill in the bonus percentages (night, weekend, holidays) according to your contract. Mark worked days in the calendar by selecting the shift type: Morning, After, Night, Vacation or Medical. The calculator updates in real time showing estimated net, meal vouchers and bonuses.",
        },
        {
          title: "What affects net salary",
          body: "The final net salary depends on: gross salary in the contract, number of days worked, shift types (night, weekend, holidays), meal vouchers (maximum non-taxable value per day is regulated annually), medical leave (paid differently from normally worked days), overtime and any applicable personal deductions.",
        },
        {
          title: "Basic personal deduction",
          body: "Employees with low incomes may benefit from a personal deduction, which reduces the tax base. The deduction is granted based on monthly gross income and number of dependents. Check with your employer or accountant if you are eligible, as applying it can increase net salary by several hundred RON per month.",
        },
        {
          title: "Why the estimate differs from the payslip",
          body: "The calculator provides an indicative estimate. The actual payslip may differ due to: enforcement deductions, bonuses granted or withheld, tax regularizations, medical leave days (where the base percentage differs from worked days), and the employer's internal rules on combining bonuses.",
        },
      ],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-cyan-300">{t.label}</p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t.subtitle}</p>

          <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-cyan-200">2026</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">CAS 25%</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">CASS 10%</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Tax 10%</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {t.sections.map((section, index) => (
          <article
            key={section.title}
            className="group rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-slate-900/80 hover:shadow-cyan-950/30"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-cyan-200">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/30 to-transparent" />
            </div>
            <h2 className="mb-3 text-2xl font-black leading-snug text-white transition group-hover:text-cyan-100">{section.title}</h2>
            <p className="text-[15px] leading-8 text-slate-300">{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
