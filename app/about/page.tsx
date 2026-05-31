"use client";

import { useEffect, useState } from "react";

type Lang = "ro" | "en";

type TextBlock = {
  title: string;
  body: string[];
};

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

export default function AboutPage() {
  const lang = usePageLang();

  const content = {
    ro: {
      label: "Despre proiect",
      title: "Despre Calculator Salariu",
      subtitle:
        "Calculator Salariu este o platformă creată pentru estimarea salariului lunar, a turelor, sporurilor, bonurilor de masă și a zilelor speciale de lucru din România.",
      blocks: [
        {
          title: "Scopul aplicației",
          body: [
            "Calculator Salariu a fost creat pentru angajații care vor să înțeleagă mai ușor cum se formează venitul lunar. Aplicația pornește de la salariul brut, programul de lucru, turele selectate, orele suplimentare, sporurile și bonurile de masă, apoi oferă o estimare orientativă a salariului net și a totalului lunar primit.",
            "Proiectul este util mai ales pentru persoanele care lucrează în ture, inclusiv dimineață, după-amiază, noapte, weekend sau sărbători legale. În loc să calculezi manual fiecare element, poți marca zilele în calendar și poți vedea rapid impactul asupra estimării finale.",
          ],
        },
        {
          title: "Cum funcționează estimările",
          body: [
            "Calculul folosește procentele uzuale pentru contribuțiile salariale din România: CAS, CASS și impozit pe venit. În paginile informative sunt explicate separat diferența brut/net, sporul de noapte, orele suplimentare, concediul medical, bonurile de masă și sărbătorile legale.",
            "Aplicația nu înlocuiește calculul oficial al angajatorului, dar te ajută să verifici rapid dacă estimarea este apropiată de realitate. Rezultatul poate varia în funcție de deduceri personale, prime, rețineri, contractul individual de muncă, regulamentul intern sau actualizările legislative.",
          ],
        },
        {
          title: "Pentru cine este utilă",
          body: [
            "Platforma poate fi folosită de angajați din producție, logistică, pază, retail, servicii, sănătate, transport sau alte domenii unde programul de lucru nu este mereu identic de la o lună la alta.",
            "Este utilă și pentru persoanele care vor să compare impactul bonurilor de masă, al sporurilor de noapte, al weekendurilor lucrate sau al orelor suplimentare asupra venitului lunar estimat.",
          ],
        },
        {
          title: "Limitări și transparență",
          body: [
            "Rezultatele afișate sunt estimări informative. Pentru valori finale trebuie verificat fluturașul de salariu, contractul de muncă, politica internă a angajatorului sau departamentul HR/contabilitate.",
            "Nu solicităm parole sau date bancare prin email. Datele introduse în aplicație sunt folosite pentru funcționarea calculatorului și pentru salvarea preferințelor contului, acolo unde utilizatorul alege să folosească funcțiile de cont.",
          ],
        },
      ] as TextBlock[],
      relatedTitle: "Articole recomandate",
      related: [
        { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
        { href: "/calculator-brut-net", label: "Diferența brut / net" },
        { href: "/bonuri-de-masa", label: "Bonuri de masă" },
        { href: "/spor-de-noapte", label: "Spor de noapte" },
        { href: "/concediu-medical", label: "Concediu medical" },
        { href: "/sarbatori-legale-2026", label: "Sărbători legale 2026" },
        { href: "/faq", label: "Întrebări frecvente" },
      ] as RelatedArticle[],
    },
    en: {
      label: "About the project",
      title: "About Salary Calculator",
      subtitle:
        "Salary Calculator is a platform built to estimate monthly salary, shifts, bonuses, meal vouchers and special working days in Romania.",
      blocks: [
        {
          title: "App purpose",
          body: [
            "Salary Calculator was created for employees who want to understand more easily how their monthly income is formed. The app starts from the gross salary, work schedule, selected shifts, overtime, bonuses and meal vouchers, then provides an indicative estimate of the net salary and the monthly total received.",
            "The project is especially useful for people working shifts, including morning, afternoon, night, weekend or public holiday work. Instead of calculating each element manually, users can mark days in the calendar and quickly see the impact on the final estimate.",
          ],
        },
        {
          title: "How estimates work",
          body: [
            "The calculation uses the usual salary contribution percentages in Romania: CAS, CASS and income tax. The informational pages separately explain gross versus net salary, night bonus, overtime, medical leave, meal vouchers and legal holidays.",
            "The app does not replace the employer’s official payroll calculation, but it helps users quickly check whether an estimate is close to reality. The result may vary depending on personal deductions, bonuses, deductions, the employment contract, internal company policy or legislative updates.",
          ],
        },
        {
          title: "Who it is useful for",
          body: [
            "The platform can be used by employees in production, logistics, security, retail, services, healthcare, transport or other fields where the work schedule is not always identical from one month to another.",
            "It is also useful for people who want to compare the impact of meal vouchers, night work, weekend shifts or overtime hours on their estimated monthly income.",
          ],
        },
        {
          title: "Limits and transparency",
          body: [
            "The displayed results are informational estimates. For final values, users should check their payslip, employment contract, employer policy or HR/accounting department.",
            "We do not request passwords or banking information by email. Data entered in the app is used for the calculator to work and to save account preferences where the user chooses to use account features.",
          ],
        },
      ] as TextBlock[],
      relatedTitle: "Recommended articles",
      related: [
        { href: "/calculator-salariu-2026", label: "Salary guide 2026" },
        { href: "/calculator-brut-net", label: "Gross / net difference" },
        { href: "/bonuri-de-masa", label: "Meal vouchers" },
        { href: "/spor-de-noapte", label: "Night bonus" },
        { href: "/concediu-medical", label: "Medical leave" },
        { href: "/sarbatori-legale-2026", label: "Legal holidays 2026" },
        { href: "/faq", label: "Frequently asked questions" },
      ] as RelatedArticle[],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-cyan-300">{content.label}</p>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{content.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{content.subtitle}</p>
      </section>

      <article className="mt-8 grid gap-5 md:grid-cols-2">
        {content.blocks.map((block) => (
          <section
            key={block.title}
            className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-slate-900/80"
          >
            <h2 className="mb-4 text-2xl font-black text-white">{block.title}</h2>
            <div className="space-y-4 text-[15px] leading-8 text-slate-300">
              {block.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </article>

      <section className="mt-8 rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6">
        <h2 className="mb-4 text-2xl font-black text-white">{content.relatedTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.related.map((item) => (
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
