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

function AdSlot({ label: _label }: { label: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot =
    process.env.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT ||
    process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT;

  useEffect(() => {
    if (!client || !slot || client.includes("XXXX")) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_e) {}
  }, [client, slot]);

  if (!client || !slot || client.includes("XXXX")) return null;

  return (
    <div className="my-8" data-ad-slot="manual-content-ad">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={client}
        data-ad-slot={slot}
      />
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
    "label": "FAQ salarii",
    "title": "Întrebări frecvente despre salarii și calculator",
    "subtitle": "Răspunsuri rapide pentru cele mai frecvente întrebări despre calculul salariului, sporuri, bonuri și utilizarea aplicației.",
    "intro": [
        "Această pagină grupează întrebările frecvente despre calculator și despre elementele care pot influența venitul lunar. Răspunsurile sunt scrise simplu, pentru utilizare rapidă.",
        "Dacă vrei explicații mai detaliate, folosește paginile dedicate din ghid: brut/net, sporuri, bonuri de masă și concediu medical."
    ],
    "sections": [
        {
            "title": "Întrebări despre calcul",
            "body": [
                "Calculatorul folosește valorile introduse de tine: salariu brut, taxe, sporuri, bonuri și ture. Dacă una dintre valori este greșită, rezultatul va fi influențat.",
                "Rezultatul este estimativ și trebuie comparat cu documentele oficiale."
            ]
        },
        {
            "title": "Întrebări despre ture",
            "body": [
                "Turele Morning, After și Night sunt marcate pe zile în calendar. Weekendurile și sărbătorile sunt detectate automat.",
                "Pentru ore suplimentare, completează câmpul dedicat din ziua selectată."
            ]
        },
        {
            "title": "Întrebări despre cont",
            "body": [
                "Contul permite salvarea setărilor, sincronizarea datelor și acces la istoric.",
                "Pentru securitate, unele funcții pot cere autentificare și conexiune la internet."
            ]
        },
        {
            "title": "Întrebări despre Premium",
            "body": [
                "Premium oferă acces extins, istoric și utilizare fără limitările planului free.",
                "Statusul Premium este citit din profilul contului tău și se sincronizează automat."
            ]
        }
    ],
    "examples": [
        {
            "title": "Exemplu întrebare",
            "body": "Dacă netul pare prea mare sau prea mic, verifică întâi salariul brut, procentele de taxe și numărul de zile lucrate."
        },
        {
            "title": "Exemplu utilizare",
            "body": "Pentru o lună nouă, setează luna corectă, marchează turele și verifică rezultatul în Calcul Live."
        }
    ],
    "faq": [
        {
            "q": "De ce nu văd același rezultat ca pe fluturaș?",
            "a": "Pentru că pot exista deduceri, prime, rețineri sau reguli interne care nu sunt introduse în calculator."
        },
        {
            "q": "Datele mele rămân salvate?",
            "a": "Da, pentru utilizatorii autentificați setările pot fi sincronizate în cont."
        },
        {
            "q": "Pot șterge contul?",
            "a": "Da, există pagină dedicată pentru ștergerea contului și a datelor asociate."
        }
    ],
    "disclaimer": "FAQ-ul este informativ și nu înlocuiește verificările oficiale.",
    "relatedTitle": "Articole utile",
    "backHome": "Înapoi la calculator",
    "adLabel": "Spațiu publicitar / AdSense"
},
  en: {
    "label": "Salary FAQ",
    "title": "Frequently asked questions about salary and the calculator",
    "subtitle": "Quick answers for common questions about salary calculation, bonuses, vouchers and app usage.",
    "intro": [
        "This page groups frequent questions about the calculator and the elements that may influence monthly income. Answers are written simply for quick use.",
        "For detailed explanations, open the dedicated guide pages: gross/net, bonuses, meal vouchers and medical leave."
    ],
    "sections": [
        {
            "title": "Calculation questions",
            "body": [
                "The calculator uses your inputs: gross salary, taxes, bonuses, vouchers and shifts. Wrong inputs influence the result.",
                "The result is an estimate and should be compared with official documents."
            ]
        },
        {
            "title": "Shift questions",
            "body": [
                "Morning, After and Night shifts are marked in the calendar. Weekends and legal holidays are detected automatically.",
                "For overtime, fill in the dedicated field on the selected day."
            ]
        },
        {
            "title": "Account questions",
            "body": [
                "The account enables saved settings, data sync and history access.",
                "For security, some features require authentication and internet connection."
            ]
        },
        {
            "title": "Premium questions",
            "body": [
                "Premium provides extended access, history and fewer plan limitations.",
                "Premium status is read from your account profile and syncs automatically."
            ]
        }
    ],
    "examples": [
        {
            "title": "Question example",
            "body": "If net salary looks too high or too low, first check gross salary, tax percentages and worked days."
        },
        {
            "title": "Usage example",
            "body": "For a new month, select the correct month, mark shifts and check Live Calculation."
        }
    ],
    "faq": [
        {
            "q": "Why is the result different from my payslip?",
            "a": "Because deductions, bonuses, withholdings or internal rules may not be entered in the calculator."
        },
        {
            "q": "Is my data saved?",
            "a": "For signed-in users, settings can be synced to the account."
        },
        {
            "q": "Can I delete my account?",
            "a": "Yes, there is a dedicated account deletion page."
        }
    ],
    "disclaimer": "The FAQ is informational and does not replace official checks.",
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
