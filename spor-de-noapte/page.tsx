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
      title: 'Spor de noapte',
      subtitle: 'Cum se estimează sporul de noapte pentru angajații care lucrează în ture.',
      sections: [
    {
      title: 'Când se aplică',
      body: 'În calculator, sporul de noapte se aplică atunci când marchezi o zi cu tura Night sau când bifezi OT noapte pentru ore suplimentare.',
    },
    {
      title: 'Setarea procentului',
      body: 'Procentul se configurează în pagina Reguli. Fiecare utilizator trebuie să introducă procentul aplicabil contractului său.',
    },
    {
      title: 'Cumularea cu alte sporuri',
      body: 'Dacă munca de noapte se suprapune cu weekendul sau o sărbătoare legală, sporurile pot fi cumulate în funcție de regulile angajatorului.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Night shift bonus',
      subtitle: 'How the night shift bonus is estimated for employees working shifts.',
      sections: [
    {
      title: 'When it applies',
      body: 'In the calculator, the night bonus applies when you mark a day as Night or when you check OT night for overtime.',
    },
    {
      title: 'Setting the percentage',
      body: 'The percentage is configured in the Rules page. Each user should enter the percentage applicable to their contract.',
    },
    {
      title: 'Combining with other bonuses',
      body: "If night work overlaps with a weekend or legal holiday, bonuses may be combined depending on the employer's rules.",
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
