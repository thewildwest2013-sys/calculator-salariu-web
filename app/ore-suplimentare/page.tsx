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
