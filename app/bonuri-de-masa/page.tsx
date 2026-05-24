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
      title: 'Bonuri de masă',
      subtitle: 'Cum se includ bonurile de masă în estimarea venitului lunar.',
      sections: [
    {
      title: 'Ce sunt bonurile de masă',
      body: 'Bonurile de masă sunt beneficii acordate pentru zilele lucrate și se adaugă separat față de salariul net.',
    },
    {
      title: 'Configurare',
      body: 'Valoarea bonului pe zi se introduce în pagina Reguli, apoi calculatorul o aplică în funcție de zilele lucrate.',
    },
    {
      title: 'Diferențe între angajatori',
      body: 'Unele companii pot avea reguli interne diferite pentru acordarea bonurilor.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Meal vouchers',
      subtitle: 'How meal vouchers are included in the monthly income estimate.',
      sections: [
    {
      title: 'What meal vouchers are',
      body: 'Meal vouchers are benefits granted for worked days and are added separately from net salary.',
    },
    {
      title: 'Configuration',
      body: 'The daily voucher value is entered in the Rules page, then the calculator applies it based on worked days.',
    },
    {
      title: 'Differences between employers',
      body: 'Some companies may have different internal rules for granting meal vouchers.',
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
