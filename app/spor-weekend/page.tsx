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
      title: "Spor de weekend 2026",
      subtitle:
        "Drepturile angajaților care lucrează sâmbăta și duminica, cum se calculează sporul de weekend și cum îl configurezi în calculator.",
      sections: [
        {
          title: "Este obligatoriu sporul de weekend prin lege?",
          body: "Codul Muncii nu prevede explicit un spor de weekend obligatoriu pentru toate categoriile de angajați, spre deosebire de sporul de noapte. Dreptul la spor de weekend depinde de contractul colectiv de muncă la nivel de ramură sau unitate. Verifică contractul tău: unele domenii (comerț, sănătate, securitate) prevăd sporuri de 10–35% pentru munca în weekend.",
        },
        {
          title: "Cum se calculează sporul de weekend",
          body: "Formula: (Salariu brut / Ore lunare) × Ore weekend × Procent spor. Exemplu: brut 5.500 lei, 168 ore/lună, 4 ture de weekend a 8 ore = 32 ore weekend, spor 15%. Salariu orar = 5.500 / 168 = 32,7 lei. Spor total = 32,7 × 32 × 15% = 157 lei brut suplimentar. La net rămân aproximativ 92 lei.",
        },
        {
          title: "Weekend și spor de noapte simultan",
          body: "Dacă tura de noapte cade sâmbătă sau duminică, multe contracte colective prevăd acordarea ambelor sporuri. Exemplu: brut 6.000 lei, tură noapte de 8 ore în weekend, spor noapte 25% + spor weekend 15%. Salariu orar = 35,7 lei. Spor noapte = 35,7 × 8 × 25% = 71,4 lei. Spor weekend = 35,7 × 8 × 15% = 42,8 lei. Total suplimentar = 114,2 lei brut.",
        },
        {
          title: "Detectare automată în calculator",
          body: "Aplicația identifică automat sâmbetele și duminicile din calendarul lunar. Când marchezi o tură în aceste zile, procentul de weekend configurat în pagina Reguli este aplicat automat. Poți seta procentul la 0 dacă angajatorul tău nu acordă spor de weekend, sau la valoarea din contractul tău.",
        },
        {
          title: "Weekend + Sărbătoare legală",
          body: "Dacă o sărbătoare legală pică sâmbătă sau duminică și lucrezi, regula generală este că sporul de sărbătoare (100%) prevalează față de sporul de weekend. Unele contracte prevăd cumulul parțial. Legea acordă prioritate beneficiului maxim pentru angajat. Verifică regulamentul intern sau contractul colectiv.",
        },
        {
          title: "Programul în ture și weekendul",
          body: "Angajații cu program în ture (de exemplu 12/24 sau 8 ore pe 3 schimburi) lucrează inevitabil în weekenduri. Spre deosebire de angajații cu program fix luni-vineri, pentru cei în ture weekendul face parte din programul normal. Dacă contractul tău prevede spor de weekend, acesta se aplică indiferent de tipul turei (Morning, After sau Night).",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Weekend bonus 2026",
      subtitle:
        "Rights of employees working Saturday and Sunday, how the weekend bonus is calculated and how to configure it in the calculator.",
      sections: [
        {
          title: "Is the weekend bonus mandatory by law?",
          body: "The Labour Code does not explicitly provide a mandatory weekend bonus for all employee categories, unlike the night shift bonus. The right to a weekend bonus depends on the collective labour agreement at sector or company level. Check your contract: some sectors (retail, healthcare, security) provide bonuses of 10–35% for weekend work.",
        },
        {
          title: "How the weekend bonus is calculated",
          body: "Formula: (Gross salary / Monthly hours) × Weekend hours × Bonus percentage. Example: gross 5,500 RON, 168 hours/month, 4 weekend shifts of 8 hours = 32 weekend hours, 15% bonus. Hourly rate = 5,500 / 168 = 32.7 RON. Total bonus = 32.7 × 32 × 15% = 157 RON additional gross. Approximately 92 RON net.",
        },
        {
          title: "Weekend and night shift bonus simultaneously",
          body: "If a night shift falls on Saturday or Sunday, many collective agreements provide both bonuses. Example: gross 6,000 RON, 8-hour night shift on weekend, night bonus 25% + weekend bonus 15%. Hourly rate = 35.7 RON. Night bonus = 35.7 × 8 × 25% = 71.4 RON. Weekend bonus = 35.7 × 8 × 15% = 42.8 RON. Total additional = 114.2 RON gross.",
        },
        {
          title: "Automatic detection in the calculator",
          body: "The app automatically identifies Saturdays and Sundays in the monthly calendar. When you mark a shift on these days, the weekend percentage configured on the Rules page is automatically applied. You can set the percentage to 0 if your employer does not grant a weekend bonus, or to the value in your contract.",
        },
        {
          title: "Weekend + Public holiday",
          body: "If a public holiday falls on Saturday or Sunday and you work, the general rule is that the holiday bonus (100%) takes precedence over the weekend bonus. Some agreements provide partial combining. The law gives priority to the maximum benefit for the employee. Check the internal rules or collective agreement.",
        },
        {
          title: "Shift schedules and the weekend",
          body: "Employees working shifts (e.g. 12/24 or 8-hour 3-shift schedules) inevitably work on weekends. Unlike employees with fixed Monday-to-Friday schedules, for shift workers the weekend is part of the normal schedule. If your contract provides a weekend bonus, it applies regardless of the shift type (Morning, After or Night).",
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
