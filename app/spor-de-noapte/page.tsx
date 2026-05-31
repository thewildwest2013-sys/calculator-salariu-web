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
      title: "Spor de noapte 2026",
      subtitle:
        "Ghid complet despre sporul de noapte în România: când se aplică, ce spune legea, cum se calculează și cum îl urmărești în calculator.",
      sections: [
        {
          title: "Ce prevede legea pentru munca de noapte",
          body: "Conform Codului Muncii (art. 123), salariații care lucrează cel puțin 3 ore din timpul normal de lucru între orele 22:00 și 06:00 au dreptul la un spor de minimum 25% din salariul de bază. Angajatorul poate stabili prin contract colectiv sau individual un procent mai mare. Sporul este obligatoriu și nu poate fi eliminat prin acord.",
        },
        {
          title: "Cum se calculează sporul de noapte",
          body: "Formula standard: Spor noapte = (Salariu brut / Număr ore lucrate în lună) × Ore noapte × Procent spor. Exemplu: brut 6.000 lei, 168 ore/lună, 10 ture de noapte a 8 ore (80 ore noapte), spor 25%. Salariu orar = 6.000 / 168 = 35,7 lei. Spor total = 35,7 × 80 × 25% = 714 lei brut adăugat.",
        },
        {
          title: "Spor noapte în calculatorul nostru",
          body: "Marchează în calendar zilele cu tură de noapte selectând opțiunea Night. În pagina Reguli, setează procentul de spor conform contractului tău (minim 25% conform legii). Calculatorul estimează automat impactul asupra salariului net, inclusiv contribuțiile aferente sporului.",
        },
        {
          title: "Cumulul cu sporul de weekend",
          body: "Dacă tura de noapte cade sâmbătă sau duminică, sporurile se pot cumula în funcție de contractul colectiv de muncă. Unii angajatori acordă ambele sporuri separat, alții aplică cel mai favorabil. Verifică regulamentul intern. În calculator poți seta ambele procente și marchezi ziua ca Night + Weekend.",
        },
        {
          title: "Cumulul cu sporul de sărbătoare legală",
          body: "Dacă lucrezi noaptea într-o sărbătoare legală, legislația prevede că angajatorul trebuie să acorde fie compensare cu zile libere, fie spor de 100% din salariul de bază, plus sporul de noapte. Combinat, venitul dintr-o tură noapte în sărbătoare legală poate fi semnificativ mai mare față de o zi normală.",
        },
        {
          title: "Impactul fiscal al sporului de noapte",
          body: "Sporul de noapte intră în venitul brut și este supus acelorași contribuții: CAS 25%, CASS 10% și impozit 10%. Nu există scutire fiscală pentru sporul de noapte în regimul general. Excepție fac anumite categorii profesionale (personalul medical, militar) care pot beneficia de regimuri diferite.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Night shift bonus 2026",
      subtitle:
        "Complete guide on the night shift bonus in Romania: when it applies, what the law says, how it is calculated and how to track it in the calculator.",
      sections: [
        {
          title: "What the law provides for night work",
          body: "According to the Labour Code (art. 123), employees who work at least 3 hours of their normal working time between 22:00 and 06:00 are entitled to a bonus of at least 25% of their base salary. The employer may set a higher percentage through collective or individual contract. The bonus is mandatory and cannot be eliminated by agreement.",
        },
        {
          title: "How the night shift bonus is calculated",
          body: "Standard formula: Night bonus = (Gross salary / Monthly worked hours) × Night hours × Bonus percentage. Example: gross 6,000 RON, 168 hours/month, 10 night shifts of 8 hours each (80 night hours), bonus 25%. Hourly rate = 6,000 / 168 = 35.7 RON. Total bonus = 35.7 × 80 × 25% = 714 RON added gross.",
        },
        {
          title: "Night bonus in our calculator",
          body: "Mark days with night shifts in the calendar by selecting the Night option. On the Rules page, set the bonus percentage according to your contract (minimum 25% by law). The calculator automatically estimates the impact on net salary, including the contributions on the bonus.",
        },
        {
          title: "Combining with the weekend bonus",
          body: "If a night shift falls on Saturday or Sunday, bonuses may be combined depending on the collective labour agreement. Some employers grant both bonuses separately, others apply the most favourable one. Check the internal rules. In the calculator you can set both percentages and mark the day as Night + Weekend.",
        },
        {
          title: "Combining with legal holiday bonus",
          body: "If you work nights on a legal holiday, legislation provides that the employer must grant either compensatory time off or a 100% base salary bonus, plus the night shift bonus. Combined, income from a night shift on a legal holiday can be significantly higher than a normal workday.",
        },
        {
          title: "Tax impact of the night shift bonus",
          body: "The night shift bonus is included in gross income and subject to the same contributions: CAS 25%, CASS 10% and income tax 10%. There is no tax exemption for the night shift bonus under the general regime. Exceptions apply to certain professional categories (medical staff, military) who may benefit from different regimes.",
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
