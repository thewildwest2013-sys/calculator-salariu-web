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
      title: 'Sărbători legale 2026',
      subtitle: 'Calendar informativ pentru sărbătorile legale și impactul lor în calculul salarial.',
      sections: [
    {
      title: 'Detectare automată',
      body: 'Aplicația marchează automat sărbătorile legale cunoscute în calendarul lunar.',
    },
    {
      title: 'Spor de sărbătoare',
      body: 'Dacă lucrezi într-o sărbătoare legală, calculatorul poate aplica sporul configurat în pagina Reguli.',
    },
    {
      title: 'Verificare recomandată',
      body: 'Lista sărbătorilor trebuie verificată cu surse oficiale și cu regulamentul angajatorului.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Legal holidays 2026',
      subtitle: 'Informational calendar for legal holidays and their impact on salary calculation.',
      sections: [
    {
      title: 'Automatic detection',
      body: 'The app automatically marks known legal holidays in the monthly calendar.',
    },
    {
      title: 'Holiday bonus',
      body: 'If you work on a legal holiday, the calculator can apply the holiday bonus configured in the Rules page.',
    },
    {
      title: 'Recommended verification',
      body: "The holiday list should be checked against official sources and the employer's internal rules.",
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
