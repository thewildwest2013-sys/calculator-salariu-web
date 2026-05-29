"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "ro" | "en";

type Section = { title: string; body: string[] };
type PageCopy = {
  label: string;
  title: string;
  subtitle: string;
  intro: string[];
  sections: Section[];
  examples: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  disclaimer: string;
  relatedTitle: string;
  backHome: string;
  adLabel: string;
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

function AdSlot({ label }: { label: string }) {
  return (
    <div
      className="my-8 flex min-h-[96px] items-center justify-center rounded-[24px] border border-cyan-300/10 bg-cyan-300/[0.035] px-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/35"
      data-ad-slot="manual-content-ad"
    >
      {label}
    </div>
  );
}

function RelatedLinks({ title }: { title: string }) {
  const items = [
    { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
    { href: "/calculator-brut-net", label: "Brut / net" },
    { href: "/spor-de-noapte", label: "Sporuri" },
    { href: "/bonuri-de-masa", label: "Bonuri" },
    { href: "/concediu-medical", label: "Concediu medical" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-white/10 bg-[#071326]/80 px-4 py-3 text-sm font-bold text-white/82 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

const COPY: Record<Lang, PageCopy> = {
  ro: {
    "label": "Bonuri de masă",
    "title": "Bonuri de masă în calculul salariului",
    "subtitle": "Cum se introduc bonurile de masă și de ce sunt afișate separat față de salariul net.",
    "intro": [
        "Bonurile de masă sunt beneficii acordate de multe companii pentru zilele lucrate. În aplicație ele sunt calculate separat, pentru ca utilizatorul să vadă clar diferența dintre salariul net și totalul lunar estimat.",
        "Valoarea bonului pe zi se setează în Reguli, iar aplicația o aplică în funcție de zilele lucrate marcate în calendar."
    ],
    "sections": [
        {
            "title": "Cum setezi valoarea",
            "body": [
                "Intră în Reguli și completează valoarea unui bon pe zi. Dacă angajatorul schimbă valoarea, o poți modifica oricând.",
                "Setarea se salvează în cont și se aplică lunilor următoare până când o schimbi."
            ]
        },
        {
            "title": "Ce zile intră la bonuri",
            "body": [
                "În mod normal, aplicația ia în calcul zilele lucrate marcate ca Morning, After sau Night.",
                "Zilele de concediu, medical sau off pot fi tratate diferit și nu trebuie considerate automat zile cu bon."
            ]
        },
        {
            "title": "De ce apar separat",
            "body": [
                "Bonurile nu sunt același lucru cu netul salarial. De aceea aplicația afișează netul, bonurile și totalul estimat pe linii separate.",
                "Această separare ajută la compararea cu fluturașul și cu beneficiile primite."
            ]
        },
        {
            "title": "Diferențe între companii",
            "body": [
                "Regulile interne pot varia. Unele companii pot acorda bonuri diferit în funcție de prezență, tip de contract sau absențe.",
                "Dacă ai dubii, verifică regulamentul intern sau întreabă departamentul de resurse umane."
            ]
        }
    ],
    "examples": [
        {
            "title": "Exemplu calcul bonuri",
            "body": "Dacă ai 20 de zile lucrate și bonul este 30 lei/zi, totalul bonurilor este estimat la 600 lei."
        },
        {
            "title": "Exemplu zi medicală",
            "body": "O zi marcată Medical poate să nu fie inclusă în bonuri, în funcție de regulile angajatorului."
        }
    ],
    "faq": [
        {
            "q": "Bonurile sunt incluse în net?",
            "a": "Nu. În aplicație sunt afișate separat și apoi adăugate la total."
        },
        {
            "q": "Pot modifica valoarea bonului?",
            "a": "Da, în pagina Reguli."
        },
        {
            "q": "Zilele libere primesc bon?",
            "a": "În general nu, dar depinde de regulile interne."
        }
    ],
    "disclaimer": "Aceste informații sunt orientative și nu înlocuiesc regulile oficiale ale angajatorului.",
    "relatedTitle": "Articole utile",
    "backHome": "Înapoi la calculator",
    "adLabel": "Spațiu publicitar / AdSense"
},
  en: {
    "label": "Meal vouchers",
    "title": "Meal vouchers in salary calculation",
    "subtitle": "How to enter meal vouchers and why they are shown separately from net salary.",
    "intro": [
        "Meal vouchers are benefits granted by many companies for worked days. The app calculates them separately so users can clearly see net salary and estimated monthly total.",
        "The daily voucher value is set in Rules and applied based on worked days marked in the calendar."
    ],
    "sections": [
        {
            "title": "Setting the value",
            "body": [
                "Open Rules and enter the daily voucher value. If your employer changes it, you can update it anytime.",
                "The setting is saved in your account and applied until changed."
            ]
        },
        {
            "title": "Which days count",
            "body": [
                "Normally the app counts worked days marked as Morning, After or Night.",
                "Vacation, medical or off days may be handled differently."
            ]
        },
        {
            "title": "Why shown separately",
            "body": [
                "Vouchers are not the same as net salary, so the app displays net, vouchers and total separately.",
                "This separation helps compare the estimate with payslip and benefits."
            ]
        },
        {
            "title": "Company differences",
            "body": [
                "Internal rules can vary by employer, contract and attendance.",
                "When unsure, check internal rules or HR information."
            ]
        }
    ],
    "examples": [
        {
            "title": "Voucher example",
            "body": "With 20 worked days and 30 RON/day, meal vouchers are estimated at 600 RON."
        },
        {
            "title": "Medical day example",
            "body": "A Medical day may not be included for vouchers depending on employer rules."
        }
    ],
    "faq": [
        {
            "q": "Are vouchers included in net salary?",
            "a": "No. They are displayed separately and added to total."
        },
        {
            "q": "Can I change voucher value?",
            "a": "Yes, in Rules."
        },
        {
            "q": "Do days off receive vouchers?",
            "a": "Usually no, but internal rules may vary."
        }
    ],
    "disclaimer": "This information is guidance and does not replace official employer rules.",
    "relatedTitle": "Useful articles",
    "backHome": "Back to calculator",
    "adLabel": "Ad space / AdSense"
},
};

export default function Page() {
  const lang = usePageLang();
  const t = COPY[lang];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#061122_0%,#07192f_45%,#04101f_100%)] px-4 py-10 text-white">
      <article className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/65">{t.label}</p>
          <Link href="/" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]">
            {t.backHome}
          </Link>
        </div>

        <header className="rounded-[32px] border border-white/10 bg-[#071326]/82 p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] md:p-8">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">{t.subtitle}</p>
        </header>

        <AdSlot label={t.adLabel} />

        <section className="rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 leading-8 text-white/78 md:p-8">
          {t.intro.map((paragraph) => (
            <p key={paragraph} className="mb-5 last:mb-0">{paragraph}</p>
          ))}
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {t.sections.map((section, index) => (
            <section key={section.title} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 leading-7 text-white/75">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/55">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h2 className="text-2xl font-black text-white">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <AdSlot label={t.adLabel} />

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 md:p-8">
          <h2 className="text-2xl font-black">{lang === "ro" ? "Exemple practice" : "Practical examples"}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {t.examples.map((example) => (
              <div key={example.title} className="rounded-[22px] border border-cyan-300/12 bg-cyan-300/[0.035] p-4">
                <h3 className="font-black text-cyan-100">{example.title}</h3>
                <p className="mt-2 leading-7 text-white/72">{example.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
          <h2 className="text-2xl font-black">{lang === "ro" ? "Întrebări rapide" : "Quick questions"}</h2>
          <div className="mt-5 space-y-3">
            {t.faq.map((item) => (
              <details key={item.q} className="rounded-[18px] border border-white/10 bg-[#071326]/75 p-4">
                <summary className="cursor-pointer font-black text-white">{item.q}</summary>
                <p className="mt-3 leading-7 text-white/72">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-[24px] border border-amber-300/15 bg-amber-300/[0.055] p-5 leading-7 text-amber-50/78">
          {t.disclaimer}
        </div>

        <RelatedLinks title={t.relatedTitle} />
      </article>
    </main>
  );
}
