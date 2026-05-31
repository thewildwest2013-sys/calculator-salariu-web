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
      title: "Concediu medical 2026",
      subtitle:
        "Cum se calculează indemnizația de concediu medical în România, ce procente se aplică și cum marchezi zilele în calculator.",
      sections: [
        {
          title: "Baza de calcul pentru concediu medical",
          body: "Indemnizația de concediu medical se calculează pe baza mediei veniturilor brute realizate în ultimele 6 luni anterioare lunii în care a survenit incapacitatea de muncă. Din această medie se aplică un procent care variază în funcție de tipul bolii și de vechimea în muncă.",
        },
        {
          title: "Procentele aplicate pe tipuri de boală",
          body: "75% din baza de calcul: boli obișnuite, primele 90 de zile de concediu. 80% din baza de calcul: boli obișnuite dacă angajatul are vechime de peste 8 ani. 100% din baza de calcul: boli infecțioase din lista Ministerului Sănătății, tuberculoză, cancer, urgențe chirurgicale, sarcina cu risc. Primele 5 zile sunt plătite de angajator, restul de CNAS.",
        },
        {
          title: "Plata de către angajator vs. CNAS",
          body: "Primele 5 zile de concediu medical sunt suportate de angajator din fonduri proprii. Începând cu ziua a 6-a, indemnizația este suportată din bugetul Fondului național unic de asigurări sociale de sănătate (FNUASS), prin Casa de Asigurări de Sănătate. Angajatorul face avansul și ulterior recuperează suma.",
        },
        {
          title: "Exemplu de calcul concediu medical",
          body: "Angajat cu medie venituri brute ultimele 6 luni = 5.500 lei/lună. Media zilnică = 5.500 / 25 = 220 lei/zi (folosind 25 ca număr convenționalizat de zile). Concediu obișnuit 10 zile, vechime sub 8 ani: indemnizație = 220 × 10 × 75% = 1.650 lei brut. Din aceasta se rețin CAS și impozit, nu și CASS pentru concediu medical.",
        },
        {
          title: "Bonuri de masă în zilele de concediu medical",
          body: "Pe zilele de concediu medical nu se acordă bonuri de masă, deoarece acestea sunt condiționat de prezența la muncă. Calculatorul tratează zilele marcate ca Medical separat față de zilele lucrate și nu include bonuri pentru acestea. Această diferență poate reduce semnificativ totalul lunar față de o lună fără absențe.",
        },
        {
          title: "Cum marchezi în calculator",
          body: "Selectează ziua din calendar și alege opțiunea Medical. Zilele marcate sunt excluse din calculul turelor și al sporurilor, dar sunt afișate separat. Calculatorul nu poate estima exact indemnizația, deoarece depinde de media veniturilor anterioare, tipul certificatului și regulile CNAS aplicabile. Folosește calculatorul ca referință orientativă.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Medical leave 2026",
      subtitle:
        "How medical leave allowance is calculated in Romania, what percentages apply and how to mark days in the calculator.",
      sections: [
        {
          title: "Calculation base for medical leave",
          body: "The medical leave allowance is calculated based on the average gross income earned in the last 6 months prior to the month of incapacity. A percentage is applied to this average, which varies depending on the type of illness and length of service.",
        },
        {
          title: "Percentages applied by type of illness",
          body: "75% of the calculation base: ordinary illnesses, first 90 days of leave. 80% of the calculation base: ordinary illnesses if the employee has more than 8 years of service. 100% of the calculation base: infectious diseases on the Ministry of Health list, tuberculosis, cancer, surgical emergencies, at-risk pregnancy. The first 5 days are paid by the employer, the rest by CNAS.",
        },
        {
          title: "Payment by employer vs. CNAS",
          body: "The first 5 days of medical leave are borne by the employer from their own funds. From the 6th day onwards, the allowance is covered by the National Unique Fund for Social Health Insurance (FNUASS), through the Health Insurance House. The employer advances the payment and subsequently recovers the amount.",
        },
        {
          title: "Medical leave calculation example",
          body: "Employee with average gross income over last 6 months = 5,500 RON/month. Daily average = 5,500 / 25 = 220 RON/day (using 25 as the conventional number of days). Ordinary leave 10 days, service under 8 years: allowance = 220 × 10 × 75% = 1,650 RON gross. CAS and income tax are withheld from this, but not CASS for medical leave.",
        },
        {
          title: "Meal vouchers during medical leave days",
          body: "Meal vouchers are not granted for medical leave days, as they are conditional on attendance at work. The calculator treats days marked as Medical separately from worked days and does not include vouchers for them. This difference can significantly reduce the monthly total compared to a month without absences.",
        },
        {
          title: "How to mark in the calculator",
          body: "Select the day from the calendar and choose the Medical option. Marked days are excluded from the calculation of shifts and bonuses, but are displayed separately. The calculator cannot exactly estimate the allowance, as it depends on the previous income average, certificate type and applicable CNAS rules. Use the calculator as a general reference.",
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
