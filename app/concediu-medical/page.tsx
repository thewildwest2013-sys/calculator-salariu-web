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
    "label": "Concediu medical",
    "title": "Concediu medical și impactul asupra estimării",
    "subtitle": "Cum marchezi zilele medicale și cum pot influența salariul estimat.",
    "intro": [
        "Concediul medical este o situație specială care poate influența salariul, bonurile de masă și numărul de ore lucrate. Calculatorul oferă o estimare simplificată, utilă pentru orientare.",
        "Pentru situații reale, modul de plată poate depinde de tipul concediului, certificatul medical, vechime, cod indemnizație și regulile aplicabile."
    ],
    "sections": [
        {
            "title": "Cum marchezi medicalul",
            "body": [
                "Selectează ziua în calendar și alege Medical. Ziua va fi tratată separat de turele lucrate.",
                "Dacă ai mai multe zile medicale, marchează fiecare zi pentru ca estimarea lunii să fie coerentă."
            ]
        },
        {
            "title": "Setarea zilelor neplătite",
            "body": [
                "În Reguli poți introduce zile medicale neplătite sau ajustări folosite de calculator.",
                "Această setare este orientativă și trebuie verificată cu documentele oficiale."
            ]
        },
        {
            "title": "Impact asupra bonurilor",
            "body": [
                "În multe situații, zilele medicale nu sunt tratate la fel ca zilele lucrate pentru bonuri de masă.",
                "Aplicația separă bonurile de salariu pentru a vedea mai clar impactul."
            ]
        },
        {
            "title": "Verificări recomandate",
            "body": [
                "Compară estimarea cu fluturașul și cu informațiile primite de la angajator.",
                "Pentru cazuri speciale, verifică legislația aplicabilă sau cere informații de la HR/contabilitate."
            ]
        }
    ],
    "examples": [
        {
            "title": "Exemplu medical",
            "body": "Dacă ai o zi marcată Medical, calculatorul poate reduce zilele lucrate și poate ajusta totalul estimat."
        },
        {
            "title": "Exemplu cu bonuri",
            "body": "Dacă o zi medicală nu primește bon, totalul bonurilor scade față de o lună complet lucrată."
        }
    ],
    "faq": [
        {
            "q": "Calculatorul stabilește indemnizația medicală exactă?",
            "a": "Nu. Oferă doar o estimare simplificată."
        },
        {
            "q": "Pot marca mai multe zile medicale?",
            "a": "Da, selectezi fiecare zi din calendar."
        },
        {
            "q": "Medicalul afectează bonurile?",
            "a": "Poate afecta, în funcție de regulile angajatorului."
        }
    ],
    "disclaimer": "Nu reprezintă consultanță juridică sau medicală. Verifică documentele oficiale și legislația aplicabilă.",
    "relatedTitle": "Articole utile",
    "backHome": "Înapoi la calculator",
    "adLabel": "Spațiu publicitar / AdSense"
},
  en: {
    "label": "Medical leave",
    "title": "Medical leave and salary estimate impact",
    "subtitle": "How to mark medical days and how they may affect the salary estimate.",
    "intro": [
        "Medical leave is a special situation that can affect salary, meal vouchers and worked hours. The calculator provides a simplified informational estimate.",
        "In real cases, payment may depend on certificate type, leave type, seniority, compensation code and applicable rules."
    ],
    "sections": [
        {
            "title": "Marking medical leave",
            "body": [
                "Select a calendar day and choose Medical. The day is handled separately from worked shifts.",
                "If you have multiple medical days, mark each one for a coherent estimate."
            ]
        },
        {
            "title": "Unpaid day setting",
            "body": [
                "In Rules you can enter unpaid medical days or adjustments used by the calculator.",
                "This setting is informational and should be checked with official documents."
            ]
        },
        {
            "title": "Impact on vouchers",
            "body": [
                "Medical days are often not treated the same as worked days for meal vouchers.",
                "The app separates vouchers from salary to make the impact clearer."
            ]
        },
        {
            "title": "Recommended checks",
            "body": [
                "Compare the estimate with your payslip and employer information.",
                "For special cases, check law or ask HR/accounting."
            ]
        }
    ],
    "examples": [
        {
            "title": "Medical example",
            "body": "A Medical day can reduce worked days and adjust the estimated total."
        },
        {
            "title": "Voucher example",
            "body": "If a Medical day does not receive a voucher, voucher total drops compared to a fully worked month."
        }
    ],
    "faq": [
        {
            "q": "Does the calculator compute exact medical allowance?",
            "a": "No. It provides a simplified estimate."
        },
        {
            "q": "Can I mark several medical days?",
            "a": "Yes, select each day in the calendar."
        },
        {
            "q": "Does medical leave affect vouchers?",
            "a": "It may, depending on employer rules."
        }
    ],
    "disclaimer": "This is not legal or medical advice. Check official documents and applicable rules.",
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
