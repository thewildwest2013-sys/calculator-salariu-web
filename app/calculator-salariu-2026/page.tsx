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
    "label": "Ghid salarizare România",
    "title": "Ghid salariu 2026",
    "subtitle": "Ghid complet pentru folosirea calculatorului de salariu, estimarea venitului lunar și înțelegerea principalelor elemente care influențează suma finală.",
    "intro": [
        "Calculatorul de salariu este gândit pentru angajații care lucrează în ture, au bonuri de masă, sporuri sau zile speciale în lună. Scopul paginii este să explice pe înțelesul tuturor cum se citesc rezultatele și de ce suma afișată trebuie tratată ca estimare orientativă.",
        "În aplicație pornești de la salariul brut sau de la valoarea de referință stabilită de tine, apoi completezi calendarul cu turele lucrate. Rezultatul se actualizează în funcție de zilele marcate, orele lucrate, tura de noapte, weekenduri, sărbători și setările din pagina Reguli."
    ],
    "sections": [
        {
            "title": "Ce introduci în aplicație",
            "body": [
                "În pagina Reguli introduci salariul brut, valoarea bonului de masă, procentele pentru sporuri și taxele folosite în estimare. Aceste valori pot fi diferite de la un angajator la altul, de aceea aplicația îți permite să le modifici manual.",
                "Calendarul lunar este locul unde marchezi turele: Morning, After, Night, Vacation sau Medical. Zilele de weekend și sărbătorile legale sunt detectate automat, iar calculatorul le ia în considerare în estimare."
            ]
        },
        {
            "title": "Cum citești rezultatul",
            "body": [
                "Cardul Calcul Live arată rapid netul estimat, bonurile, sporurile și orele lucrate. Pentru un raport mai detaliat folosești tabul Estimare, unde vezi împărțirea pe categorii și impactul setărilor asupra totalului.",
                "Rezultatul final poate include salariul net estimat, bonuri de masă și sporuri. Dacă ai concediu medical, ore lipsă sau ore suplimentare, acestea pot modifica suma afișată."
            ]
        },
        {
            "title": "De ce estimarea poate diferi",
            "body": [
                "Suma reală de pe fluturaș poate fi influențată de deduceri, rețineri, prime, concedii, schimbări legislative sau reguli interne ale angajatorului. Din acest motiv, calculatorul este un instrument de verificare rapidă, nu un document oficial.",
                "Pentru verificări finale, compară rezultatul cu fluturașul de salariu, contractul individual de muncă, regulamentul intern și informațiile primite de la departamentul de resurse umane."
            ]
        },
        {
            "title": "Când este util calculatorul",
            "body": [
                "Este util când vrei să vezi rapid cum se schimbă salariul în funcție de ture, sporuri sau zile libere. Poți testa mai multe scenarii înainte de finalul lunii și poți salva calcule în istoric.",
                "Pentru angajații cu program variabil, aplicația oferă o imagine mai clară asupra lunii decât un calcul făcut manual într-un carnețel sau într-un fișier separat."
            ]
        }
    ],
    "examples": [
        {
            "title": "Exemplu simplu",
            "body": "Dacă setezi salariul brut, bonul de masă și alegi câteva ture de noapte, cardul Calcul Live va reflecta imediat impactul acelor zile asupra totalului estimat."
        },
        {
            "title": "Exemplu cu weekend",
            "body": "Dacă o tură cade sâmbătă sau duminică și ai setat un procent pentru weekend, aplicația poate adăuga sporul separat față de netul de bază."
        }
    ],
    "faq": [
        {
            "q": "Pot folosi calculatorul fără cont?",
            "a": "Pentru funcțiile complete, sincronizare și istoric este recomandat contul. Unele informații publice pot fi citite fără autentificare."
        },
        {
            "q": "Rezultatul este identic cu salariul oficial?",
            "a": "Nu neapărat. Este o estimare orientativă bazată pe valorile introduse de tine."
        },
        {
            "q": "Pot modifica procentele pentru sporuri?",
            "a": "Da, procentele se setează în pagina Reguli, astfel încât să se potrivească mai bine situației tale."
        }
    ],
    "disclaimer": "Informațiile sunt orientative și nu înlocuiesc calculul oficial al angajatorului, consultanța contabilă sau verificarea legislației aplicabile.",
    "relatedTitle": "Articole utile",
    "backHome": "Înapoi la calculator",
    "adLabel": "Spațiu publicitar / AdSense"
},
  en: {
    "label": "Romanian salary guide",
    "title": "Salary guide 2026",
    "subtitle": "Complete guide for using the salary calculator, estimating monthly income and understanding the main elements that influence the final amount.",
    "intro": [
        "The salary calculator is designed for employees working shifts, receiving meal vouchers, bonuses or having special days during the month. This page explains how to read the results and why the displayed amount should be treated as an estimate.",
        "In the app you start from the gross salary or your chosen reference amount, then fill the calendar with worked shifts. The result updates based on marked days, worked hours, night shifts, weekends, holidays and the Rules settings."
    ],
    "sections": [
        {
            "title": "What you enter in the app",
            "body": [
                "In Rules you enter gross salary, daily meal voucher value, bonus percentages and tax settings used for the estimate. These values may differ by employer, so the app lets you adjust them manually.",
                "The monthly calendar is where you mark shifts: Morning, After, Night, Vacation or Medical. Weekends and legal holidays are detected automatically and included in the estimate."
            ]
        },
        {
            "title": "How to read the result",
            "body": [
                "The Live Calculation card quickly shows estimated net salary, vouchers, bonuses and worked hours. For a more detailed report, use the Estimate tab.",
                "The final amount may include estimated net salary, meal vouchers and bonuses. Medical leave, missing hours or overtime can change the displayed result."
            ]
        },
        {
            "title": "Why the estimate may differ",
            "body": [
                "The official payslip can be affected by deductions, bonuses, leave, legal changes or internal employer rules. The calculator is a quick verification tool, not an official document.",
                "For final checks, compare the result with your payslip, employment contract, internal rules and HR information."
            ]
        },
        {
            "title": "When the calculator helps",
            "body": [
                "It helps when you want to see how salary changes based on shifts, bonuses or days off. You can test scenarios before the end of the month and save calculations in history.",
                "For variable schedules, the app gives a clearer monthly view than manual notes or separate files."
            ]
        }
    ],
    "examples": [
        {
            "title": "Simple example",
            "body": "Set gross salary, meal voucher value and a few night shifts; the Live Calculation card immediately shows the impact."
        },
        {
            "title": "Weekend example",
            "body": "If a shift falls on Saturday or Sunday and you set a weekend percentage, the app can add that bonus separately."
        }
    ],
    "faq": [
        {
            "q": "Can I use the calculator without an account?",
            "a": "For complete features, synchronization and history, an account is recommended."
        },
        {
            "q": "Is the result identical to the official salary?",
            "a": "Not necessarily. It is an informational estimate based on your inputs."
        },
        {
            "q": "Can I change bonus percentages?",
            "a": "Yes, percentages are configured in Rules."
        }
    ],
    "disclaimer": "This information is for guidance only and does not replace official payroll calculations, accounting advice or applicable legislation checks.",
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
