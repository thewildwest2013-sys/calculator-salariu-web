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

      if (saved === "en" || saved === "ro") {
        setLang(saved);
      }
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
      title: 'Calculator brut-net',
      subtitle: 'Explicație simplă despre diferența dintre salariul brut, salariul net și venitul total estimat.',
      sections: [
    {
      title: 'Salariul brut',
      body: 'Salariul brut este valoarea de referință înainte de taxe și contribuții. Acesta este punctul de plecare pentru calcul.',
    },
    {
      title: 'Salariul net',
      body: 'Salariul net este suma estimată după aplicarea contribuțiilor și impozitului configurate în aplicație.',
    },
    {
      title: 'Venitul total',
      body: 'Venitul total poate include salariul net, bonurile de masă și sporurile aplicabile pentru turele lucrate.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Gross-to-net calculator',
      subtitle: 'Simple explanation of the difference between gross salary, net salary and estimated total income.',
      sections: [
    {
      title: 'Gross salary',
      body: 'Gross salary is the reference amount before taxes and contributions. It is the starting point for the calculation.',
    },
    {
      title: 'Net salary',
      body: 'Net salary is the estimated amount after applying the contributions and income tax configured in the app.',
    },
    {
      title: 'Total income',
      body: 'Total income may include net salary, meal vouchers and applicable bonuses for worked shifts.',
    }
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
