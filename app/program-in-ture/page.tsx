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
      title: 'Program în ture',
      subtitle: 'Tutorial pentru completarea calendarului lunar de lucru.',
      sections: [
    {
      title: 'Alege ziua',
      body: 'Apasă pe ziua din calendar și selectează tura potrivită: Morning, After, Night, Liber, Concediu sau Medical.',
    },
    {
      title: 'Configurează regulile',
      body: 'Înainte de calcul, introdu salariul brut, sporurile și bonurile de masă în pagina Reguli.',
    },
    {
      title: 'Urmărește calculul live',
      body: 'Panoul din dreapta se actualizează automat pe măsură ce completezi calendarul.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Shift schedule',
      subtitle: 'Tutorial for filling in the monthly work calendar.',
      sections: [
    {
      title: 'Choose the day',
      body: 'Click a day in the calendar and select the right shift: Morning, After, Night, Off, Vacation or Medical.',
    },
    {
      title: 'Configure the rules',
      body: 'Before calculating, enter your gross salary, bonuses and meal vouchers in the Rules page.',
    },
    {
      title: 'Watch the live calculation',
      body: 'The panel on the right updates automatically as you fill in the calendar.',
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
