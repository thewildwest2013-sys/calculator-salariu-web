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
    "label": "Sporuri și beneficii",
    "title": "Sporuri și beneficii salariale",
    "subtitle": "Ghid despre sporul de noapte, weekend, sărbători, ore suplimentare și alte beneficii urmărite în aplicație.",
    "intro": [
        "Sporurile sunt sume suplimentare care pot apărea în funcție de tura lucrată, intervalul orar, ziua săptămânii sau situațiile speciale din lună. Calculatorul te ajută să vezi separat impactul lor asupra venitului estimat.",
        "Pentru o estimare cât mai apropiată, introdu procentele aplicabile în Reguli și marchează corect zilele din calendar."
    ],
    "sections": [
        {
            "title": "Spor de noapte",
            "body": [
                "Se aplică atunci când marchezi o zi cu tura Night sau bifezi ore suplimentare de noapte.",
                "Procentul trebuie setat în funcție de contractul tău sau de regulile angajatorului."
            ]
        },
        {
            "title": "Spor de weekend",
            "body": [
                "Weekendul este detectat automat în calendar. Dacă ai procent de weekend setat, aplicația poate estima impactul acelor ture.",
                "Regulile pot varia între companii, de aceea procentul este configurabil."
            ]
        },
        {
            "title": "Sărbători legale",
            "body": [
                "Sărbătorile legale sunt marcate automat pentru anul selectat. Dacă lucrezi într-o astfel de zi, poate apărea spor de sărbătoare.",
                "Verifică mereu dacă angajatorul acordă compensare, zile libere sau spor."
            ]
        },
        {
            "title": "Ore suplimentare",
            "body": [
                "Orele suplimentare se introduc pe ziua selectată. Poți bifa dacă ele sunt de noapte, weekend sau sărbătoare.",
                "Astfel poți vedea separat impactul orelor suplimentare asupra totalului."
            ]
        }
    ],
    "examples": [
        {
            "title": "Exemplu tură noapte",
            "body": "O tură Night într-o zi lucrătoare poate adăuga spor de noapte pe baza procentului configurat."
        },
        {
            "title": "Exemplu weekend + noapte",
            "body": "Dacă ai noapte în weekend, calculatorul poate estima mai multe componente, dar verificarea finală rămâne la angajator."
        }
    ],
    "faq": [
        {
            "q": "Sporurile se cumulează mereu?",
            "a": "Nu neapărat. Depinde de contract și de regulile interne."
        },
        {
            "q": "Pot seta procentul manual?",
            "a": "Da, toate procentele importante sunt configurabile."
        },
        {
            "q": "Calculatorul știe automat weekendurile?",
            "a": "Da, sâmbăta și duminica sunt detectate automat."
        }
    ],
    "disclaimer": "Informațiile sunt orientative. Pentru drepturi exacte, verifică legislația, contractul și regulamentul intern.",
    "relatedTitle": "Articole utile",
    "backHome": "Înapoi la calculator",
    "adLabel": "Spațiu publicitar / AdSense"
},
  en: {
    "label": "Bonuses and benefits",
    "title": "Salary bonuses and benefits",
    "subtitle": "Guide for night, weekend, holiday, overtime bonuses and benefits tracked by the app.",
    "intro": [
        "Bonuses are additional amounts that may appear depending on shift type, time interval, weekday or special monthly situations. The calculator helps show their estimated impact separately.",
        "For a closer estimate, enter applicable percentages in Rules and mark calendar days correctly."
    ],
    "sections": [
        {
            "title": "Night bonus",
            "body": [
                "Applies when you mark a day as Night or check night overtime.",
                "The percentage should match your contract or employer rules."
            ]
        },
        {
            "title": "Weekend bonus",
            "body": [
                "Weekends are detected automatically. If a weekend percentage is set, the app estimates those shifts.",
                "Rules vary, so the percentage is configurable."
            ]
        },
        {
            "title": "Legal holidays",
            "body": [
                "Legal holidays are marked automatically for the selected year. Working on such days may add holiday bonus.",
                "Check whether the employer grants compensation, days off or bonus."
            ]
        },
        {
            "title": "Overtime",
            "body": [
                "Overtime is entered on the selected day. You can mark it as night, weekend or holiday overtime.",
                "This helps isolate overtime impact in the total estimate."
            ]
        }
    ],
    "examples": [
        {
            "title": "Night shift example",
            "body": "A Night shift on a regular day can add a night bonus based on your configured percentage."
        },
        {
            "title": "Weekend + night example",
            "body": "If a night shift falls on a weekend, multiple components may apply depending on employer rules."
        }
    ],
    "faq": [
        {
            "q": "Do bonuses always combine?",
            "a": "Not always. It depends on the contract and internal rules."
        },
        {
            "q": "Can I set percentages manually?",
            "a": "Yes, important percentages are configurable."
        },
        {
            "q": "Does the calculator detect weekends?",
            "a": "Yes, Saturdays and Sundays are detected automatically."
        }
    ],
    "disclaimer": "This is informational. For exact rights, check law, contract and internal rules.",
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
