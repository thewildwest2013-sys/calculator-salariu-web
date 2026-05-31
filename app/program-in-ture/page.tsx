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
      title: "Program în ture 2026",
      subtitle:
        "Ghid pentru angajații cu program în ture: cum completezi corect calendarul, ce tipuri de ture există și cum îți estimezi salariul lunar.",
      sections: [
        {
          title: "Tipuri de ture disponibile în calculator",
          body: "Calculatorul acceptă 5 tipuri de marcaje zilnice: Morning (tură de dimineață, de obicei 06:00–14:00 sau 07:00–15:00), After (tură de după-amiază, 14:00–22:00), Night (tură de noapte, 22:00–06:00), Vacation (concediu de odihnă) și Medical (concediu medical). Fiecare tip este tratat diferit în calculul sporurilor și al bonurilor.",
        },
        {
          title: "Programul 12/24 ore și calculul corect",
          body: "Angajații cu program 12 ore muncă / 24 ore libere trebuie să marcheze în calculator fiecare zi de 12 ore lucrate. În pagina Reguli, setează Hours/shift la 12 în loc de 8. Astfel calculatorul estimează corect orele totale, sporul de noapte pentru turele care includ interval 22:00–06:00 și numărul de bonuri de masă.",
        },
        {
          title: "Program 3 schimburi (8 ore × 3)",
          body: "Sistemul clasic cu 3 schimburi a câte 8 ore (Morning/After/Night) este cel mai frecvent în producție, sănătate și servicii. Marchează fiecare zi cu tipul corect de tură. Turele Night generează spor de noapte dacă procentul este setat. Turele din weekend generează spor de weekend dacă contractul îl prevede.",
        },
        {
          title: "Configurarea corectă a paginii Reguli",
          body: "Înainte de a completa calendarul, setează în Reguli: salariul brut din contract, valoarea bonului de masă per zi, procentele de spor (noapte, weekend, sărbătoare, ore suplimentare), CAS (25%), CASS (10%), impozit (10%) și numărul de ore per tură (8 sau 12). Acești parametri sunt baza oricărei estimări corecte.",
        },
        {
          title: "Cum calculezi câte ture ai lucrat",
          body: "La sfârșitul lunii, calendarul completat îți arată: numărul de ture Morning, After și Night, numărul total de ore lucrate, zilele de concediu și medical, și un sumar al sporurilor estimate. Poți exporta sau salva istoricul calculelor pentru a compara lunile sau pentru a verifica fluturașul.",
        },
        {
          title: "Diferențe față de un program fix",
          body: "Angajații în ture au venituri mai variabile decât cei cu program fix, deoarece numărul de ture de noapte și de weekend diferă de la o lună la alta. Un calcul corect necesită completarea zilnică a calendarului. Estimările bazate pe medie lunară pot fi inexacte cu ±10–15% față de fluturaș, în funcție de distribuția turelor.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Shift schedule 2026",
      subtitle:
        "Guide for shift employees: how to correctly fill in the calendar, what types of shifts exist and how to estimate your monthly salary.",
      sections: [
        {
          title: "Types of shifts available in the calculator",
          body: "The calculator accepts 5 types of daily markings: Morning (morning shift, usually 06:00–14:00 or 07:00–15:00), After (afternoon shift, 14:00–22:00), Night (night shift, 22:00–06:00), Vacation (annual leave) and Medical (medical leave). Each type is handled differently in the calculation of bonuses and meal vouchers.",
        },
        {
          title: "The 12/24-hour schedule and correct calculation",
          body: "Employees working 12 hours on / 24 hours off must mark each 12-hour working day in the calculator. On the Rules page, set Hours/shift to 12 instead of 8. This allows the calculator to correctly estimate total hours, the night bonus for shifts that include the 22:00–06:00 interval, and the number of meal vouchers.",
        },
        {
          title: "3-shift schedule (8 hours × 3)",
          body: "The classic 3-shift system with 8-hour shifts (Morning/After/Night) is most common in manufacturing, healthcare and services. Mark each day with the correct shift type. Night shifts generate a night bonus if the percentage is set. Weekend shifts generate a weekend bonus if the contract provides for it.",
        },
        {
          title: "Correct configuration of the Rules page",
          body: "Before filling in the calendar, set in Rules: gross salary from contract, meal voucher value per day, bonus percentages (night, weekend, holiday, overtime), CAS (25%), CASS (10%), income tax (10%) and hours per shift (8 or 12). These parameters are the basis of any correct estimate.",
        },
        {
          title: "How to calculate how many shifts you have worked",
          body: "At the end of the month, the completed calendar shows you: the number of Morning, After and Night shifts, total hours worked, leave and medical days, and a summary of estimated bonuses. You can export or save calculation history to compare months or verify your payslip.",
        },
        {
          title: "Differences from a fixed schedule",
          body: "Shift employees have more variable income than those with fixed schedules, because the number of night and weekend shifts differs from month to month. An accurate calculation requires daily calendar entries. Average-based estimates may be inaccurate by ±10–15% compared to the payslip, depending on shift distribution.",
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
