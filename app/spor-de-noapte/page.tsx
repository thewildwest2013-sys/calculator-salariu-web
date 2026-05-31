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
