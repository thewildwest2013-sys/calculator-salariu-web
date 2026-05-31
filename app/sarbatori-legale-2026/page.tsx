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

export default function Page() {
  const lang = usePageLang();

  const t = {
    ro: {
      label: "Ghid salarizare România",
      title: "Sărbători legale 2026",
      subtitle:
        "Lista completă a sărbătorilor legale din România în 2026, drepturile angajaților care lucrează în aceste zile și calculul sporului.",
      sections: [
        {
          title: "Sărbătorile legale în România 2026",
          body: "Conform Codului Muncii, sărbătorile legale în 2026 sunt: 1 ianuarie (Anul Nou), 2 ianuarie, 24 ianuarie (Unirea Principatelor), 7 și 8 aprilie (Paștele ortodox 2026), 1 mai (Ziua Muncii), 25 mai (Înălțarea), 14 și 15 iunie (Rusaliile), 15 august (Adormirea Maicii Domnului), 30 noiembrie (Sf. Andrei), 1 decembrie (Ziua Națională), 25 și 26 decembrie (Crăciunul).",
        },
        {
          title: "Drepturile angajatului care lucrează în zi de sărbătoare",
          body: "Angajatorul are două opțiuni legale: (1) acordarea unui număr egal de zile libere în termen de 30 de zile de la sărbătoare; sau (2) plata unui spor de minimum 100% din salariul de bază pentru orele lucrate. Alegerea între cele două variante aparține angajatorului, dacă nu există prevederi contractuale specifice.",
        },
        {
          title: "Exemplu de calcul spor sărbătoare legală",
          body: "Angajat cu salariu brut 6.000 lei, 21 zile lucratoare în lună, lucrează 1 zi de sărbătoare legală. Salariu orar = 6.000 / (21 × 8) = 35,7 lei. Spor 100% pentru 8 ore = 35,7 × 8 = 285,6 lei brut suplimentar. La net, după contribuții, rămân aproximativ 167 lei în plus față de o zi normală.",
        },
        {
          title: "Detectare automată în calculator",
          body: "Aplicația detectează automat toate sărbătorile legale din calendarul anului selectat și le marchează vizual. Când marchezi o tură într-o zi de sărbătoare, calculatorul poate aplica procentul de spor configurat în pagina Reguli. Poți verifica dacă o zi este sărbătoare trecând cu cursorul peste ea în calendar.",
        },
        {
          title: "Sărbători care coincid cu weekendul",
          body: "Dacă o sărbătoare legală pică sâmbătă sau duminică, angajații care au program de luni până vineri beneficiază de o zi liberă compensatorie în ziua lucrătoare imediat următoare. Cei cu program în ture nu beneficiază automat de această regulă — verifică contractul colectiv de muncă aplicabil.",
        },
        {
          title: "Concediu în zilele de sărbătoare legală",
          body: "Zilele de sărbătoare legală nu se includ în zilele de concediu de odihnă. Dacă ai concediu și în acea perioadă pică o sărbătoare legală, aceasta nu se scade din concediul anual. Astfel, dacă ai planuit concediu pe o săptămână cu o sărbătoare, efectiv vei folosi un număr mai mic de zile de concediu.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Legal holidays 2026",
      subtitle:
        "Complete list of legal holidays in Romania in 2026, rights of employees working on these days and bonus calculation.",
      sections: [
        {
          title: "Legal holidays in Romania 2026",
          body: "According to the Labour Code, legal holidays in 2026 are: January 1 (New Year's Day), January 2, January 24 (Union of the Principalities), April 7 and 8 (Orthodox Easter 2026), May 1 (Labour Day), May 25 (Ascension Day), June 14 and 15 (Pentecost), August 15 (Assumption of Mary), November 30 (St. Andrew's Day), December 1 (National Day), December 25 and 26 (Christmas).",
        },
        {
          title: "Rights of employees working on a public holiday",
          body: "The employer has two legal options: (1) granting an equal number of days off within 30 days of the holiday; or (2) paying a bonus of at least 100% of the base salary for hours worked. The choice between the two options belongs to the employer, unless there are specific contractual provisions.",
        },
        {
          title: "Public holiday bonus calculation example",
          body: "Employee with 6,000 RON gross salary, 21 working days in the month, works 1 public holiday. Hourly rate = 6,000 / (21 × 8) = 35.7 RON. 100% bonus for 8 hours = 35.7 × 8 = 285.6 RON additional gross. Net, after contributions, approximately 167 RON more than a normal workday.",
        },
        {
          title: "Automatic detection in the calculator",
          body: "The app automatically detects all legal holidays in the selected year's calendar and marks them visually. When you mark a shift on a public holiday, the calculator can apply the bonus percentage configured on the Rules page. You can verify if a day is a public holiday by hovering over it in the calendar.",
        },
        {
          title: "Holidays falling on weekends",
          body: "If a legal holiday falls on a Saturday or Sunday, employees with a Monday-to-Friday schedule receive a compensatory day off on the next working day. Those working shifts do not automatically benefit from this rule — check the applicable collective labour agreement.",
        },
        {
          title: "Annual leave on public holidays",
          body: "Public holidays are not counted as annual leave days. If you are on leave during a period that includes a public holiday, it is not deducted from your annual leave entitlement. So if you plan leave for a week containing a holiday, you will effectively use fewer leave days.",
        },
      ],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-100">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-blue-300">{t.label}</p>
      <h1 className="mb-4 text-4xl font-bold">{t.title}</h1>
      <p className="mb-8 text-lg leading-8 text-slate-300">{t.subtitle}</p>
      <article className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 leading-8 text-slate-200">
        {t.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-2xl font-semibold">{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
