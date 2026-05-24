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

export default function ContactPage() {
  const lang = usePageLang();

  const t = {
    ro: {
      title: "Contact",
      intro:
        "Pentru întrebări despre aplicație, erori, sugestii sau solicitări legate de date, ne poți contacta prin email.",
      emailTitle: "Email",
      responseTitle: "Timp de răspuns",
      response: "Încercăm să răspundem în 24–72 de ore, în funcție de volumul solicitărilor.",
      sendTitle: "Ce poți trimite",
      items: [
        "probleme tehnice din aplicație;",
        "sugestii pentru calcul și interfață;",
        "solicitări de ștergere sau clarificare date;",
        "întrebări despre funcțiile Free/Premium.",
      ],
    },
    en: {
      title: "Contact",
      intro:
        "For questions about the app, errors, suggestions or data-related requests, you can contact us by email.",
      emailTitle: "Email",
      responseTitle: "Response time",
      response: "We try to respond within 24–72 hours, depending on request volume.",
      sendTitle: "What you can send",
      items: [
        "technical issues in the app;",
        "suggestions for calculation and interface improvements;",
        "requests for data deletion or clarification;",
        "questions about Free/Premium features.",
      ],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-100">
      <h1 className="mb-6 text-4xl font-bold">{t.title}</h1>
      <div className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 leading-8 text-slate-200">
        <p>{t.intro}</p>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.emailTitle}</h2>
          <p>
            <a className="text-blue-300 underline" href="mailto:helpcalculatorsalariu@gmail.com">
              helpcalculatorsalariu@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.responseTitle}</h2>
          <p>{t.response}</p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.sendTitle}</h2>
          <ul className="list-disc pl-6">
            {t.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
