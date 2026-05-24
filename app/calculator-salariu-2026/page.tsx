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
      title: 'Ghid salariu 2026',
      subtitle: 'Ghid informativ pentru estimarea salariului net, a sporurilor și a veniturilor lunare în România.',
      sections: [
    {
      title: 'Cum folosești calculatorul',
      body: 'Configurează salariul brut, sporurile și bonurile în pagina Reguli, apoi completează calendarul lunar cu turele lucrate.',
    },
    {
      title: 'De ce rezultatul este estimativ',
      body: 'Calculul poate varia în funcție de contract, regulament intern, zile libere, concedii și modificări legislative.',
    },
    {
      title: 'Ce poți verifica',
      body: 'Poți urmări salariul net estimat, bonurile de masă, sporurile de noapte, weekend, sărbătoare și ore suplimentare.',
    }
  ],
    },
    en: {
      label: "Romanian salary guide",
      title: 'Salary guide 2026',
      subtitle: 'Informational guide for estimating net salary, bonuses and monthly income in Romania.',
      sections: [
    {
      title: 'How to use the calculator',
      body: 'Set the gross salary, bonuses and meal vouchers in the Rules page, then fill in the monthly calendar with your worked shifts.',
    },
    {
      title: 'Why the result is an estimate',
      body: 'The calculation may vary depending on the employment contract, internal rules, days off, leave and legal changes.',
    },
    {
      title: 'What you can check',
      body: 'You can track estimated net salary, meal vouchers, night, weekend, holiday bonuses and overtime.',
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
