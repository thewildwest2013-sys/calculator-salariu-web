"use client";

import { useEffect, useState } from "react";

type Lang = "ro" | "en";

type FAQItem = {
  question: string;
  answer: string;
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

export default function FAQPage() {
  const lang = usePageLang();
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const t = {
    ro: {
      label: "FAQ",
      title: "Întrebări frecvente",
      subtitle:
        "Răspunsuri detaliate la cele mai comune întrebări despre calculul salariului net, sporuri, bonuri de masă, concediu medical și utilizarea aplicației.",
      show: "Arată răspunsul",
      hide: "Ascunde răspunsul",
      items: [
        {
          question: "Ce procente se aplică în 2026 pentru CAS, CASS și impozit?",
          answer:
            "În mod obișnuit, contribuțiile salariale folosite în calcul sunt CAS 25% din salariul brut, CASS 10% din salariul brut și impozit pe venit 10% aplicat bazei impozabile. Baza impozabilă este, în general, salariul brut minus CAS și CASS, cu posibile ajustări prin deducere personală sau scutiri, în funcție de situația angajatului.",
        },
        {
          question: "Calculatorul oferă valori identice cu fluturașul de salariu?",
          answer:
            "Nu. Calculatorul oferă estimări orientative. Fluturașul oficial poate include deduceri personale, prime, rețineri, regularizări, concedii medicale, ore suplimentare validate separat sau alte elemente specifice angajatorului. Pentru suma finală, verifică documentele oficiale de salarizare sau discută cu departamentul HR/contabilitate.",
        },
        {
          question: "Cum se calculează salariul net din brut?",
          answer:
            "Formula de bază pornește de la salariul brut. Se scad contribuțiile CAS și CASS, apoi se aplică impozitul pe venit asupra bazei impozabile. Rezultatul este salariul net estimat. Bonurile de masă se adaugă separat, iar sporurile se adaugă de regulă la brut înainte de calculul contribuțiilor.",
        },
        {
          question: "Cum se calculează sporul de noapte?",
          answer:
            "Sporul de noapte se calculează în funcție de orele lucrate în intervalul de noapte și procentul aplicabil. În aplicație poți seta procentul dorit, iar pagina dedicată sporului de noapte explică formula cu exemple numerice. De regulă, se folosește salariul brut împărțit la orele lunare, înmulțit cu orele de noapte și cu procentul de spor.",
        },
        {
          question: "Cum se calculează orele suplimentare?",
          answer:
            "Orele suplimentare sunt introduse separat în calendar, pe fiecare zi. Aplicația folosește salariul orar estimat și procentul de overtime setat în reguli. Poți marca suplimentar dacă orele suplimentare au fost noaptea, în weekend sau într-o zi de sărbătoare, astfel încât sporurile să fie incluse în estimare.",
        },
        {
          question: "Bonurile de masă sunt incluse în salariul net?",
          answer:
            "Bonurile de masă sunt afișate separat față de salariul net estimat. Ele se adaugă la totalul lunar primit, dar nu sunt tratate ca salariu brut obișnuit în calculul CAS, CASS și impozitului. Valoarea lor depinde de suma pe zi și de numărul de zile lucrate efectiv.",
        },
        {
          question: "Primesc bonuri de masă în concediu medical sau concediu de odihnă?",
          answer:
            "În general, bonurile de masă se acordă pentru zilele lucrate efectiv. Pentru zilele de concediu medical nu se acordă bonuri de masă. Pentru concediul de odihnă, regulile pot depinde de politica angajatorului și de contract, dar aplicația tratează zilele speciale separat pentru a păstra estimarea cât mai clară.",
        },
        {
          question: "Cum funcționează concediul medical în calculator?",
          answer:
            "Concediul medical este tratat separat de zilele lucrate. În mod general, primele zile pot fi suportate de angajator, iar restul de CNAS, în funcție de tipul concediului și de legislația aplicabilă. Estimarea din aplicație este orientativă și trebuie verificată cu documentele medicale și salariale oficiale.",
        },
        {
          question: "Ce se întâmplă dacă lucrez într-o zi de sărbătoare legală?",
          answer:
            "Dacă lucrezi într-o zi de sărbătoare legală, pot exista drepturi la compensare prin timp liber sau spor salarial, în funcție de legislație, contract și politica angajatorului. În calculator poți marca orele ca fiind de sărbătoare pentru a vedea impactul estimat asupra venitului.",
        },
        {
          question: "Pot folosi aplicația fără cont?",
          answer:
            "Funcțiile de bază pot fi consultate pe site, iar paginile informative sunt disponibile public. Pentru salvarea setărilor, istoricul calculelor și sincronizarea datelor între sesiuni, este necesar cont de utilizator.",
        },
        {
          question: "Ce beneficii oferă Premium?",
          answer:
            "Planul Premium este gândit pentru utilizatorii care calculează frecvent salariul și vor acces extins la funcții. Poate include istoric, salvarea calculelor, limită extinsă sau eliminarea unor restricții pentru utilizatorii care folosesc aplicația des.",
        },
        {
          question: "Datele mele sunt salvate?",
          answer:
            "Dacă folosești un cont, anumite setări și calcule pot fi salvate pentru sincronizare și istoric. Site-ul nu are nevoie de date bancare pentru calculul salariului și nu solicită parole prin email. Poți consulta paginile Privacy și Delete account pentru detalii despre date și ștergere.",
        },
        {
          question: "Pot schimba dispozitivul sau browserul?",
          answer:
            "Aplicația include mecanisme de securitate pentru cont și dispozitiv. În anumite situații poate fi necesară confirmarea sau resetarea sesiunii pentru a muta contul pe alt browser sau dispozitiv. Pagina Security explică starea sesiunii și opțiunile disponibile.",
        },
        {
          question: "De ce rezultatul meu diferă față de calcul?",
          answer:
            "Diferențele pot apărea din cauza deducerilor personale, primelor, reținerilor, concediilor, orelor validate diferit de angajator, contractului colectiv sau altor reguli interne. Calculatorul este util pentru estimare și verificare rapidă, dar nu înlocuiește fluturașul oficial.",
        },
        {
          question: "Sunt informațiile garantate?",
          answer:
            "Nu. Informațiile sunt orientative și au scop informativ. Legislația, procentele și regulile de salarizare se pot modifica, iar angajatorii pot aplica situații specifice. Pentru decizii fiscale, juridice sau salariale importante, verifică sursele oficiale sau discută cu un specialist.",
        },
      ] as FAQItem[],
      relatedTitle: "Articole recomandate",
      related: [
        { href: "/about", label: "Despre proiect" },
        { href: "/calculator-brut-net", label: "Diferența brut / net" },
        { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
        { href: "/bonuri-de-masa", label: "Bonuri de masă" },
        { href: "/spor-de-noapte", label: "Spor de noapte" },
        { href: "/concediu-medical", label: "Concediu medical" },
      ] as RelatedArticle[],
    },
    en: {
      label: "FAQ",
      title: "Frequently asked questions",
      subtitle:
        "Detailed answers to common questions about net salary calculation, bonuses, meal vouchers, medical leave and using the app.",
      show: "Show answer",
      hide: "Hide answer",
      items: [
        {
          question: "What percentages apply in 2026 for CAS, CASS and income tax?",
          answer:
            "The usual salary contributions used in the calculation are CAS 25% of gross salary, CASS 10% of gross salary and 10% income tax applied to the taxable base. The taxable base is generally gross salary minus CAS and CASS, with possible adjustments through personal deductions or exemptions depending on the employee’s situation.",
        },
        {
          question: "Does the calculator provide values identical to the payslip?",
          answer:
            "No. The calculator provides indicative estimates. The official payslip may include personal deductions, bonuses, deductions, tax regularizations, medical leave, separately validated overtime or other elements specific to the employer. For the final amount, check official payroll documents or speak with HR/accounting.",
        },
        {
          question: "How is net salary calculated from gross salary?",
          answer:
            "The basic formula starts from the gross salary. CAS and CASS are deducted, then income tax is applied to the taxable base. The result is the estimated net salary. Meal vouchers are added separately, while bonuses are usually added to the gross amount before salary contributions are calculated.",
        },
        {
          question: "How is the night bonus calculated?",
          answer:
            "The night bonus is calculated based on the hours worked during the night interval and the applicable percentage. In the app you can set the desired percentage, while the dedicated night bonus page explains the formula with numerical examples. Usually, gross salary is divided by monthly hours, then multiplied by night hours and the bonus percentage.",
        },
        {
          question: "How is overtime calculated?",
          answer:
            "Overtime hours are entered separately in the calendar for each day. The app uses the estimated hourly salary and the overtime percentage set in the rules. You can additionally mark whether overtime was at night, during the weekend or on a legal holiday so the bonuses are included in the estimate.",
        },
        {
          question: "Are meal vouchers included in net salary?",
          answer:
            "Meal vouchers are shown separately from the estimated net salary. They are added to the monthly total received, but they are not treated like regular gross salary in the CAS, CASS and income tax calculation. Their value depends on the daily amount and the number of actually worked days.",
        },
        {
          question: "Do I receive meal vouchers during medical leave or vacation?",
          answer:
            "In general, meal vouchers are granted for actually worked days. For medical leave days, meal vouchers are not granted. For annual leave, rules may depend on employer policy and the employment contract, but the app treats special days separately to keep the estimate clear.",
        },
        {
          question: "How does medical leave work in the calculator?",
          answer:
            "Medical leave is treated separately from worked days. In general, the first days may be covered by the employer and the remaining period by CNAS, depending on the type of leave and applicable legislation. The app estimate is informational and should be checked against official medical and payroll documents.",
        },
        {
          question: "What happens if I work on a legal holiday?",
          answer:
            "If you work on a legal holiday, you may have rights to compensation through time off or salary bonus, depending on legislation, contract and employer policy. In the calculator, you can mark hours as holiday work to see the estimated impact on income.",
        },
        {
          question: "Can I use the app without an account?",
          answer:
            "The basic informational pages are publicly available on the site. To save settings, keep calculation history and synchronize data between sessions, a user account is required.",
        },
        {
          question: "What benefits does Premium offer?",
          answer:
            "The Premium plan is designed for users who calculate salary frequently and want extended access to features. It may include history, saved calculations, extended limits or removal of some restrictions for users who use the app often.",
        },
        {
          question: "Is my data saved?",
          answer:
            "If you use an account, some settings and calculations may be saved for synchronization and history. The site does not need banking details to calculate salary and does not request passwords by email. Check the Privacy and Delete account pages for details about data and deletion.",
        },
        {
          question: "Can I change device or browser?",
          answer:
            "The app includes security mechanisms for account and device access. In some situations, confirmation or session reset may be needed to move the account to another browser or device. The Security page explains the session status and available options.",
        },
        {
          question: "Why is my result different from the calculation?",
          answer:
            "Differences may appear because of personal deductions, bonuses, deductions, leave, hours validated differently by the employer, collective agreement or other internal rules. The calculator is useful for estimation and quick verification, but it does not replace the official payslip.",
        },
        {
          question: "Are the information and results guaranteed?",
          answer:
            "No. The information is indicative and informational. Legislation, percentages and payroll rules may change, and employers may apply specific situations. For important tax, legal or payroll decisions, check official sources or speak with a specialist.",
        },
      ] as FAQItem[],
      relatedTitle: "Recommended articles",
      related: [
        { href: "/about", label: "About the project" },
        { href: "/calculator-brut-net", label: "Gross / net difference" },
        { href: "/calculator-salariu-2026", label: "Salary guide 2026" },
        { href: "/bonuri-de-masa", label: "Meal vouchers" },
        { href: "/spor-de-noapte", label: "Night bonus" },
        { href: "/concediu-medical", label: "Medical leave" },
      ] as RelatedArticle[],
    },
  }[lang];

  function toggleItem(index: number) {
    setOpenItems((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-cyan-300">{t.label}</p>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t.subtitle}</p>
      </section>

      <section className="mt-8 space-y-3">
        {t.items.map((item, index) => {
          const isOpen = openItems.includes(index);

          return (
            <article
              key={item.question}
              className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/55 shadow-lg shadow-slate-950/20 transition duration-300 hover:border-cyan-300/45 hover:bg-slate-900/80"
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-4">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-cyan-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-black leading-snug text-white sm:text-lg">{item.question}</span>
                </span>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-200">
                  {isOpen ? t.hide : t.show}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4 text-[15px] leading-8 text-slate-300 sm:px-6">
                  {item.answer}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6">
        <h2 className="mb-4 text-2xl font-black text-white">{t.relatedTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.related.map((article) => (
            <a
              key={article.href}
              href={article.href}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/90 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.08]"
            >
              {article.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
