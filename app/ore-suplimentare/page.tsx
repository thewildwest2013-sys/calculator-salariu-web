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
      title: "Ore suplimentare 2026",
      subtitle:
        "Drepturi legale pentru orele suplimentare în România, sporul minim obligatoriu și cum le incluzi în estimarea salarială.",
      sections: [
        {
          title: "Ce prevede Codul Muncii pentru orele suplimentare",
          body: "Orele suplimentare sunt orele lucrate peste durata normală de 8 ore/zi sau 40 ore/săptămână. Conform art. 122 din Codul Muncii, compensarea orelor suplimentare se face prin ore libere acordate în 60 de zile sau, dacă aceasta nu este posibilă, prin spor de minimum 75% din salariul de bază. Orele suplimentare nu pot depăși 8 ore/săptămână.",
        },
        {
          title: "Calculul sporului pentru ore suplimentare",
          body: "Formula: (Salariu brut / Ore lunare) × Ore suplimentare × (1 + procent spor). Exemplu: brut 6.500 lei, 168 ore/lună, 10 ore suplimentare, spor 75%. Salariu orar = 6.500 / 168 = 38,7 lei. Plată ore suplimentare = 38,7 × 10 × 175% = 677 lei brut total (din care 387 lei normal + 290 lei spor).",
        },
        {
          title: "Ore suplimentare noaptea sau în weekend",
          body: "Dacă orele suplimentare sunt prestate noaptea (22:00–06:00) sau în weekend, se aplică cumulativ sporul de ore suplimentare cu sporul de noapte sau weekend, conform contractului colectiv. Exemplu: ore suplimentare noaptea pot atrage spor de 75% (OT) + 25% (noapte) = 100% spor față de tariful normal.",
        },
        {
          title: "Limite legale și obligații angajator",
          body: "Angajatorul nu poate obliga un salariat să lucreze mai mult de 48 de ore/săptămână, inclusiv orele suplimentare, calculată ca medie pe o perioadă de referință de 4 luni. Pentru tinerii sub 18 ani, limita este de 40 ore/săptămână fără ore suplimentare. Refuzul de a efectua ore suplimentare nu poate constitui motiv de sancțiune.",
        },
        {
          title: "Cum introduci orele suplimentare în calculator",
          body: "Selectează ziua din calendar și activează opțiunea de ore suplimentare (OT). Poți specifica numărul de ore suplimentare și dacă acestea sunt de noapte, weekend sau sărbătoare. Calculatorul estimează impactul lor brut și net, adăugat la salariul de bază din acea zi.",
        },
        {
          title: "Impactul fiscal al orelor suplimentare",
          body: "Sporul de ore suplimentare intră în venitul brut lunar și este supus CAS (25%), CASS (10%) și impozit (10%), la fel ca salariul de bază. Nu există scutire fiscală pentru sporul de ore suplimentare în regimul general. Totuși, orele suplimentare compensate cu zile libere nu generează venit suplimentar și nu sunt impozitate.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Overtime 2026",
      subtitle:
        "Legal rights for overtime in Romania, minimum mandatory bonus and how to include overtime in your salary estimate.",
      sections: [
        {
          title: "What the Labour Code provides for overtime",
          body: "Overtime refers to hours worked beyond the standard 8 hours/day or 40 hours/week. According to art. 122 of the Labour Code, overtime compensation is provided through time off granted within 60 days or, if not possible, through a bonus of at least 75% of the base salary. Overtime cannot exceed 8 hours/week.",
        },
        {
          title: "Calculation of the overtime bonus",
          body: "Formula: (Gross salary / Monthly hours) × Overtime hours × (1 + bonus percentage). Example: gross 6,500 RON, 168 hours/month, 10 overtime hours, 75% bonus. Hourly rate = 6,500 / 168 = 38.7 RON. Overtime payment = 38.7 × 10 × 175% = 677 RON gross total (of which 387 RON normal + 290 RON bonus).",
        },
        {
          title: "Overtime at night or on weekends",
          body: "If overtime is worked at night (22:00–06:00) or on weekends, the overtime bonus is applied cumulatively with the night or weekend bonus according to the collective agreement. Example: nighttime overtime may attract a bonus of 75% (OT) + 25% (night) = 100% bonus on top of the normal rate.",
        },
        {
          title: "Legal limits and employer obligations",
          body: "The employer cannot require an employee to work more than 48 hours/week, including overtime, calculated as an average over a 4-month reference period. For those under 18, the limit is 40 hours/week with no overtime. Refusal to work overtime cannot constitute grounds for disciplinary action.",
        },
        {
          title: "How to enter overtime in the calculator",
          body: "Select the day from the calendar and activate the overtime (OT) option. You can specify the number of overtime hours and whether they are at night, on a weekend or public holiday. The calculator estimates their gross and net impact, added to the base salary for that day.",
        },
        {
          title: "Tax impact of overtime",
          body: "The overtime bonus is included in monthly gross income and is subject to CAS (25%), CASS (10%) and income tax (10%), just like the base salary. There is no tax exemption for the overtime bonus under the general regime. However, overtime compensated with time off generates no additional income and is not taxed.",
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
