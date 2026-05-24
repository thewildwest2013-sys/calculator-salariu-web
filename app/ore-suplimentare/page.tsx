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
      title: 'Ore suplimentare',
      subtitle: 'Cum introduci corect orele suplimentare și zilele libere lucrate.',
      sections: [
    {
      title: 'Când folosești OT',
      body: 'Folosește Ore suplimentare când lucrezi peste program sau când ești chemat într-o zi liberă.',
    },
    {
      title: 'Zi liberă lucrată',
      body: 'Dacă ziua era Liber și ai lucrat 8 ore, lasă orele efective la 0 și introdu 8 la Ore suplimentare.',
    },
    {
      title: 'Bife suplimentare',
      body: 'Bifează OT noapte, OT weekend sau OT sărbătoare dacă orele suplimentare au avut aceste condiții.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Overtime',
      subtitle: 'How to correctly enter overtime and worked days off.',
      sections: [
    {
      title: 'When to use OT',
      body: 'Use Overtime when you work beyond your normal schedule or when you are called in on a day off.',
    },
    {
      title: 'Worked day off',
      body: 'If the day was Off and you worked 8 hours, leave actual worked hours at 0 and enter 8 in Overtime.',
    },
    {
      title: 'Additional checkboxes',
      body: 'Check OT night, OT weekend or OT holiday if the overtime hours had those conditions.',
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
