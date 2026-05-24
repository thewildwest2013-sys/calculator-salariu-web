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
      title: 'Spor weekend',
      subtitle: 'Cum se estimează munca în weekend pentru angajații în ture.',
      sections: [
    {
      title: 'Detectare automată',
      body: 'Calendarul detectează automat zilele de sâmbătă și duminică.',
    },
    {
      title: 'Aplicarea sporului',
      body: 'Dacă lucrezi în weekend, calculatorul poate aplica procentul configurat în Reguli.',
    },
    {
      title: 'Cazuri speciale',
      body: 'Weekendul poate fi combinat cu noapte, sărbătoare legală sau ore suplimentare.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Weekend bonus',
      subtitle: 'How weekend work is estimated for shift employees.',
      sections: [
    {
      title: 'Automatic detection',
      body: 'The calendar automatically detects Saturdays and Sundays.',
    },
    {
      title: 'Applying the bonus',
      body: 'If you work on a weekend, the calculator can apply the percentage configured in Rules.',
    },
    {
      title: 'Special cases',
      body: 'Weekend work may be combined with night work, legal holidays or overtime.',
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
