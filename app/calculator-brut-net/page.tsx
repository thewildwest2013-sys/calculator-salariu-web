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
      title: "Calculator brut-net 2026",
      subtitle:
        "Explicație detaliată despre diferența dintre salariul brut și net, cu formula de calcul și exemple concrete pentru 2026.",
      sections: [
        {
          title: "Formula de calcul brut → net",
          body: "Calculul se face în trei pași: (1) CAS = brut × 25%; (2) CASS = brut × 10%; (3) Bază impozabilă = brut − CAS − CASS; (4) Impozit = bază impozabilă × 10%; (5) Net = brut − CAS − CASS − impozit. Dacă ai deducere personală, aceasta se scade din baza impozabilă înainte de aplicarea impozitului.",
        },
        {
          title: "Exemplu concret: brut 4.050 lei (salariu minim)",
          body: "CAS = 4.050 × 25% = 1.012,5 lei. CASS = 4.050 × 10% = 405 lei. Bază impozabilă = 4.050 − 1.012,5 − 405 = 2.632,5 lei. Impozit = 2.632,5 × 10% = 263,25 lei. Net estimat = 4.050 − 1.012,5 − 405 − 263,25 = 2.369 lei. La care se adaugă bonurile de masă pentru zilele lucrate.",
        },
        {
          title: "Exemplu concret: brut 7.000 lei",
          body: "CAS = 1.750 lei. CASS = 700 lei. Bază impozabilă = 4.550 lei. Impozit = 455 lei. Net estimat = 4.095 lei. Dacă ai 21 de zile lucrate și bon de 35 lei/zi, adaugi 735 lei din bonuri, ajungând la un total lunar estimat de aproximativ 4.830 lei în mână.",
        },
        {
          title: "Exemplu concret: brut 13.000 lei",
          body: "CAS = 3.250 lei. CASS = 1.300 lei. Bază impozabilă = 8.450 lei. Impozit = 845 lei. Net estimat = 7.605 lei. Angajații cu salarii mari nu mai beneficiază de deducere personală, care se reduce progresiv de la salariile de peste 2 ori salariul minim.",
        },
        {
          title: "Bonurile de masă și impozitarea lor",
          body: "Bonurile de masă sunt acordate netaxat până la o valoare maximă stabilită prin lege și actualizată periodic. Ele nu intră în calculul CAS, CASS sau impozit pe venit. Se adaugă separat la totalul lunar. Valoarea lor depinde de numărul de zile efectiv lucrate, nu de zilele din lună.",
        },
        {
          title: "Diferența față de total angajator",
          body: "Pe lângă contribuțiile reținute din salariu (CAS 25% + CASS 10% + impozit 10%), angajatorul plătește și el contribuții proprii. Costul total al unui angajat pentru firmă este mai mare decât salariul brut. Acesta este motivul pentru care negocierea salariului se face întotdeauna pe brut.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Gross-to-net calculator 2026",
      subtitle:
        "Detailed explanation of the difference between gross and net salary, with the calculation formula and concrete examples for 2026.",
      sections: [
        {
          title: "Gross → net calculation formula",
          body: "The calculation is done in steps: (1) CAS = gross × 25%; (2) CASS = gross × 10%; (3) Taxable base = gross − CAS − CASS; (4) Income tax = taxable base × 10%; (5) Net = gross − CAS − CASS − income tax. If you have a personal deduction, it is subtracted from the taxable base before applying the tax.",
        },
        {
          title: "Concrete example: gross 4,050 RON (minimum wage)",
          body: "CAS = 4,050 × 25% = 1,012.5 RON. CASS = 4,050 × 10% = 405 RON. Taxable base = 4,050 − 1,012.5 − 405 = 2,632.5 RON. Income tax = 2,632.5 × 10% = 263.25 RON. Estimated net = 4,050 − 1,012.5 − 405 − 263.25 = 2,369 RON. Meal vouchers for worked days are added on top.",
        },
        {
          title: "Concrete example: gross 7,000 RON",
          body: "CAS = 1,750 RON. CASS = 700 RON. Taxable base = 4,550 RON. Income tax = 455 RON. Estimated net = 4,095 RON. If you have 21 worked days and a 35 RON/day voucher, you add 735 RON from vouchers, reaching an estimated monthly total of approximately 4,830 RON in hand.",
        },
        {
          title: "Concrete example: gross 13,000 RON",
          body: "CAS = 3,250 RON. CASS = 1,300 RON. Taxable base = 8,450 RON. Income tax = 845 RON. Estimated net = 7,605 RON. Employees with higher salaries no longer benefit from the personal deduction, which reduces progressively for salaries above twice the minimum wage.",
        },
        {
          title: "Meal vouchers and their taxation",
          body: "Meal vouchers are granted tax-free up to a maximum value set by law and updated periodically. They are not included in the CAS, CASS or income tax calculation. They are added separately to the monthly total. Their value depends on the number of days actually worked, not the days in the month.",
        },
        {
          title: "Difference from total employer cost",
          body: "In addition to contributions withheld from salary (CAS 25% + CASS 10% + income tax 10%), the employer also pays their own contributions. The total cost of an employee to the company is higher than the gross salary. This is why salary negotiations always take place on the gross amount.",
        },
      ],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-100">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-blue-300">{t.label}</p>
      <h1 className="mb-4 text-4xl font-bold">{t.title}</h1>
      <p className="mb-8 text-lg leading-8 text-slate-300">{t.subtitle}</p>
      <article className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 leading-8 text-slate-200">
        {t.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-2xl font-semibold">{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
