"use client";

import { useEffect, useState } from "react";

type Lang = "ro" | "en";

type RelatedArticle = {
  href: string;
  label: string;
};

function usePageLang() {
  const [lang, setLang] = useState<Lang>("ro");

  useEffect(() => {
    const readLang = () => {
      const saved =
        localStorage.getItem("calculator-salariu-lang") ||
        localStorage.getItem("salary-lang-v1") ||
        localStorage.getItem("lang") ||
        localStorage.getItem("language");

      if (saved === "en" || saved === "ro") setLang(saved);
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
      label: "Suport",
      title: "Contact",
      intro:
        "Pentru întrebări despre aplicație, erori, sugestii sau solicitări legate de date, ne poți contacta prin email. Încercăm să răspundem clar și cât mai rapid, în funcție de volumul solicitărilor.",
      emailTitle: "Email suport",
      responseTitle: "Timp de răspuns",
      response:
        "În mod normal încercăm să răspundem în 24–72 de ore. Pentru probleme tehnice, ajută să trimiți și o scurtă descriere a pașilor care au dus la eroare, dispozitivul folosit și pagina unde a apărut problema.",
      sendTitle: "Ce poți trimite",
      items: [
        "probleme tehnice din aplicație sau din cont;",
        "sugestii pentru calcul, interfață sau paginile informative;",
        "solicitări de ștergere, clarificare sau actualizare a datelor;",
        "întrebări despre funcțiile Free/Premium și despre istoricul calculelor;",
        "observații despre formule, procente sau exemplele de calcul afișate.",
      ],
      privacyTitle: "Confidențialitate",
      privacy:
        "Nu solicităm parole, date bancare sau informații sensibile prin email. Dacă ai probleme cu autentificarea, folosește pagina de login/resetare parolă. Pentru abonamente sau plăți recurente, verifică și platforma prin care ai făcut achiziția.",
      supportTitle: "Despre suport",
      support:
        "Calculator Salariu este un proiect aflat în dezvoltare continuă. Feedback-ul utilizatorilor ajută la îmbunătățirea calculelor, a interfeței și a explicațiilor despre salariu brut/net, sporuri, bonuri de masă, concediu medical și sărbători legale.",
      relatedTitle: "Articole recomandate",
      related: [
        { href: "/about", label: "Despre proiect" },
        { href: "/faq", label: "Întrebări frecvente" },
        { href: "/calculator-brut-net", label: "Diferența brut / net" },
        { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
        { href: "/privacy", label: "Confidențialitate" },
        { href: "/terms", label: "Termeni" },
      ] as RelatedArticle[],
    },
    en: {
      label: "Support",
      title: "Contact",
      intro:
        "For questions about the app, errors, suggestions or data-related requests, you can contact us by email. We try to respond clearly and as quickly as possible, depending on request volume.",
      emailTitle: "Support email",
      responseTitle: "Response time",
      response:
        "We usually try to respond within 24–72 hours. For technical issues, it helps to include a short description of the steps that caused the error, the device used and the page where the problem appeared.",
      sendTitle: "What you can send",
      items: [
        "technical issues in the app or account;",
        "suggestions for calculation, interface or informational pages;",
        "requests for data deletion, clarification or update;",
        "questions about Free/Premium features and calculation history;",
        "observations about formulas, percentages or displayed calculation examples.",
      ],
      privacyTitle: "Privacy",
      privacy:
        "We do not request passwords, banking details or sensitive information by email. If you have authentication issues, use the login/password reset page. For subscriptions or recurring payments, also check the platform where you purchased them.",
      supportTitle: "About support",
      support:
        "Salary Calculator is a project under continuous development. User feedback helps improve calculations, interface and explanations about gross/net salary, bonuses, meal vouchers, medical leave and legal holidays.",
      relatedTitle: "Recommended articles",
      related: [
        { href: "/about", label: "About the project" },
        { href: "/faq", label: "Frequently asked questions" },
        { href: "/calculator-brut-net", label: "Gross / net difference" },
        { href: "/calculator-salariu-2026", label: "Salary guide 2026" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ] as RelatedArticle[],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-cyan-300">{t.label}</p>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t.intro}</p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200">
          <h2 className="mb-2 text-2xl font-black text-white">{t.emailTitle}</h2>
          <a className="text-cyan-300 underline underline-offset-4" href="mailto:helpcalculatorsalariu@gmail.com">
            helpcalculatorsalariu@gmail.com
          </a>
        </article>

        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200">
          <h2 className="mb-2 text-2xl font-black text-white">{t.responseTitle}</h2>
          <p className="text-slate-300">{t.response}</p>
        </article>

        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200">
          <h2 className="mb-3 text-2xl font-black text-white">{t.sendTitle}</h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-300">
            {t.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200">
          <h2 className="mb-2 text-2xl font-black text-white">{t.privacyTitle}</h2>
          <p className="text-slate-300">{t.privacy}</p>
        </article>

        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200 md:col-span-2">
          <h2 className="mb-2 text-2xl font-black text-white">{t.supportTitle}</h2>
          <p className="text-slate-300">{t.support}</p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6">
        <h2 className="mb-4 text-2xl font-black text-white">{t.relatedTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.related.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/90 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.08]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
