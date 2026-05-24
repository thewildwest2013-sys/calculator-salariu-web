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
      title: 'Concediu medical',
      subtitle: 'Informații generale despre introducerea zilelor de concediu medical în calculator.',
      sections: [
    {
      title: 'Cum marchezi ziua',
      body: 'În calendar, selectează ziua și alege opțiunea Medical. Astfel ziua este tratată separat de turele lucrate.',
    },
    {
      title: 'Estimare orientativă',
      body: 'Tratamentul concediului medical poate depinde de certificat, tipul concediului și regulile aplicabile. Calculatorul oferă doar o estimare.',
    },
    {
      title: 'Bonuri și ore lucrate',
      body: 'Pentru zilele medicale, bonurile și orele lucrate pot fi tratate diferit față de o zi normală de muncă.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Medical leave',
      subtitle: 'General information about entering medical leave days in the calculator.',
      sections: [
    {
      title: 'How to mark the day',
      body: 'In the calendar, select the day and choose Medical. The day is then handled separately from worked shifts.',
    },
    {
      title: 'Informational estimate',
      body: 'Medical leave treatment may depend on the certificate, leave type and applicable rules. The calculator only provides an estimate.',
    },
    {
      title: 'Meal vouchers and worked hours',
      body: 'For medical leave days, meal vouchers and worked hours may be handled differently from a normal workday.',
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
