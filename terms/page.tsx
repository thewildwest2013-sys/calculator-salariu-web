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

export default function TermsPage() {
  const lang = usePageLang();

  const t = {
    ro: {
      title: "Termeni și condiții",
      intro:
        "Calculator Salariu este un instrument informativ pentru estimarea veniturilor lunare. Prin folosirea site-ului accepți că rezultatele sunt orientative și nu reprezintă documente fiscale, juridice sau de salarizare oficiale.",
      responsibilityTitle: "Responsabilitatea utilizatorului",
      responsibility:
        "Utilizatorul trebuie să introducă valori corecte pentru salariu, sporuri, ore lucrate, bonuri și alte setări. Rezultatul poate varia în funcție de contract, regulament intern, legislație și modul de calcul folosit de angajator.",
      premiumTitle: "Plan Free și Premium",
      premium:
        "Anumite funcții pot fi limitate în planul gratuit. Planul Premium poate oferi acces extins, istoric suplimentar și funcții avansate. Condițiile comerciale pot fi actualizate în timp.",
      liabilityTitle: "Limitarea răspunderii",
      liability:
        "Nu garantăm că estimările vor coincide exact cu fluturașul de salariu. Pentru valori finale, verifică documentele oficiale de salarizare sau discută cu angajatorul ori departamentul HR.",
    },
    en: {
      title: "Terms and Conditions",
      intro:
        "Salary Calculator is an informational tool for estimating monthly income. By using the site, you accept that the results are estimates and do not represent official tax, legal or payroll documents.",
      responsibilityTitle: "User responsibility",
      responsibility:
        "The user must enter correct values for salary, bonuses, worked hours, meal vouchers and other settings. The result may vary depending on the employment contract, internal rules, legislation and the calculation method used by the employer.",
      premiumTitle: "Free and Premium plans",
      premium:
        "Some features may be limited in the free plan. The Premium plan may provide extended access, additional history and advanced features. Commercial conditions may be updated over time.",
      liabilityTitle: "Limitation of liability",
      liability:
        "We do not guarantee that the estimates will exactly match your payslip. For final values, check the official payroll documents or speak with your employer or HR department.",
    },
  }[lang];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-100">
      <h1 className="mb-6 text-4xl font-bold">{t.title}</h1>
      <div className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 leading-8 text-slate-200">
        <p>{t.intro}</p>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.responsibilityTitle}</h2>
          <p>{t.responsibility}</p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.premiumTitle}</h2>
          <p>{t.premium}</p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.liabilityTitle}</h2>
          <p>{t.liability}</p>
        </section>
      </div>
    </main>
  );
}
