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
    "label": "Brut / net",
    "title": "Diferența dintre salariul brut și net",
    "subtitle": "Explicație clară despre salariul brut, contribuții, impozit și venitul final estimat.",
    "intro": [
        "Salariul brut este suma de referință folosită înainte de contribuții și impozit. Salariul net este suma estimată care rămâne după aplicarea procentelor configurate în calculator.",
        "În practică, venitul lunar poate include și bonuri de masă, sporuri de noapte, weekend, sărbători sau ore suplimentare. De aceea, totalul afișat în aplicație poate fi mai mare decât netul simplu."
    ],
    "sections": [
        {
            "title": "Salariul brut",
            "body": [
                "Brutul este baza de calcul. Din el se scad contribuțiile și impozitul, conform setărilor introduse în pagina Reguli.",
                "Dacă brutul introdus nu corespunde contractului tău, rezultatul estimat va fi diferit."
            ]
        },
        {
            "title": "Salariul net",
            "body": [
                "Netul este suma rămasă după taxe. În calculator, netul se actualizează când modifici salariul brut, procentele fiscale sau turele care adaugă sporuri.",
                "Netul nu include întotdeauna bonurile de masă, de aceea aplicația le afișează separat."
            ]
        },
        {
            "title": "Bonuri și sporuri",
            "body": [
                "Bonurile de masă sunt adăugate separat la totalul estimat, în funcție de zilele lucrate.",
                "Sporurile pot crește venitul brut estimat înainte de taxare sau pot fi tratate diferit în funcție de regulile angajatorului."
            ]
        },
        {
            "title": "Când verifici diferențele",
            "body": [
                "Dacă suma din aplicație diferă de fluturaș, verifică brutul, zilele lucrate, procentele de spor și situațiile speciale din luna respectivă.",
                "Diferențele pot apărea și din prime, deduceri, rețineri sau modificări interne."
            ]
        }
    ],
    "examples": [
        {
            "title": "Exemplu brut/net",
            "body": "Dacă brutul crește, netul estimat crește proporțional, dar nu identic, pentru că se aplică taxe și contribuții."
        },
        {
            "title": "Exemplu total lunar",
            "body": "Dacă ai 20 de zile lucrate și bonuri de masă, totalul estimat include netul plus valoarea bonurilor."
        }
    ],
    "faq": [
        {
            "q": "Netul include bonurile?",
            "a": "În aplicație, bonurile sunt afișate separat și apoi adăugate la totalul estimat."
        },
        {
            "q": "Pot schimba taxele?",
            "a": "Da, valorile CAS, CASS și impozit se pot ajusta în Reguli."
        },
        {
            "q": "De ce totalul diferă de net?",
            "a": "Pentru că totalul poate include bonuri și sporuri."
        }
    ],
    "disclaimer": "Calculul este orientativ și trebuie comparat cu documentele oficiale.",
    "relatedTitle": "Articole utile",
    "backHome": "Înapoi la calculator",
    "adLabel": "Spațiu publicitar / AdSense"
},
  en: {
    "label": "Gross / net",
    "title": "Gross salary vs net salary",
    "subtitle": "Clear explanation of gross salary, contributions, tax and estimated final income.",
    "intro": [
        "Gross salary is the reference amount before contributions and tax. Net salary is the estimated amount remaining after applying the configured percentages.",
        "Monthly income may also include meal vouchers, night, weekend, holiday or overtime bonuses. That is why the app total can be higher than simple net salary."
    ],
    "sections": [
        {
            "title": "Gross salary",
            "body": [
                "Gross salary is the calculation base. Contributions and tax are subtracted from it according to Rules settings.",
                "If the entered gross amount does not match your contract, the estimate will differ."
            ]
        },
        {
            "title": "Net salary",
            "body": [
                "Net salary updates when you change gross salary, tax settings or shift bonuses.",
                "Meal vouchers are displayed separately because they are not always part of the salary net line."
            ]
        },
        {
            "title": "Vouchers and bonuses",
            "body": [
                "Meal vouchers are added separately based on worked days.",
                "Bonuses may increase the estimate depending on employer rules."
            ]
        },
        {
            "title": "Checking differences",
            "body": [
                "If the app differs from the payslip, check gross salary, worked days, bonus percentages and special situations.",
                "Differences can also come from bonuses, deductions or internal changes."
            ]
        }
    ],
    "examples": [
        {
            "title": "Gross/net example",
            "body": "If gross salary increases, net salary also increases, but not by the exact same amount because taxes apply."
        },
        {
            "title": "Monthly total example",
            "body": "With 20 worked days and meal vouchers, the final total includes net salary plus vouchers."
        }
    ],
    "faq": [
        {
            "q": "Does net include vouchers?",
            "a": "The app shows vouchers separately and adds them to estimated total."
        },
        {
            "q": "Can I change taxes?",
            "a": "Yes, CAS, CASS and tax values can be adjusted in Rules."
        },
        {
            "q": "Why is total different from net?",
            "a": "Because total may include vouchers and bonuses."
        }
    ],
    "disclaimer": "The calculation is informational and should be compared with official documents.",
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
