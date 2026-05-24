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
      title: 'Despre Calculator Salariu',
      subtitle: 'Platformă pentru estimarea salariului lunar, a turelor și a sporurilor.',
      sections: [
    {
      title: 'Scopul aplicației',
      body: 'Calculator Salariu ajută angajații care lucrează în ture să estimeze venitul lunar pe baza programului introdus.',
    },
    {
      title: 'Pentru cine este utilă',
      body: 'Aplicația este utilă pentru ture de dimineață, după-amiază, noapte, weekend, sărbători legale, concedii și ore suplimentare.',
    },
    {
      title: 'Transparență',
      body: 'Rezultatele sunt orientative și trebuie verificate cu documentele oficiale de salarizare sau cu angajatorul.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'About Salary Calculator',
      subtitle: 'A platform for estimating monthly salary, shifts and bonuses.',
      sections: [
    {
      title: 'App purpose',
      body: 'Salary Calculator helps shift employees estimate monthly income based on the schedule they enter.',
    },
    {
      title: 'Who it is useful for',
      body: 'The app is useful for morning, afternoon, night, weekend, legal holiday, leave and overtime scenarios.',
    },
    {
      title: 'Transparency',
      body: 'Results are informational estimates and should be checked against official payroll documents or with the employer.',
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
