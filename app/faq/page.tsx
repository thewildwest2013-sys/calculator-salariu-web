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

export default function FAQPage() {
  const lang = usePageLang();

  const t = {
    ro: {
      title: "Întrebări frecvente",
      subtitle: "Răspunsuri detaliate la cele mai comune întrebări despre calculul salariului net în România.",
      items: [
        [
          "Ce procente se aplică în 2026 pentru CAS, CASS și impozit?",
          "În 2026, contribuțiile standard sunt: CAS (pensie) = 25% din salariul brut, CASS (sănătate) = 10% din salariul brut, impozit pe venit = 10% din baza impozabilă (brut minus CAS minus CASS, minus deducere personală dacă e cazul). Totalul reținut poate ajunge la aproximativ 41–42% din brut pentru un angajat fără deducere personală.",
        ],
        [
          "Care este salariul minim net în România în 2026?",
          "Salariul minim brut în 2026 este de 4.050 lei. Salariul minim net estimat este de aproximativ 2.363–2.370 lei, după deducerea CAS (1.012,5 lei), CASS (405 lei) și impozit (~270 lei). La acesta se pot adăuga bonuri de masă pentru zilele lucrate.",
        ],
        [
          "Calculatorul oferă valori exacte identice cu fluturașul?",
          "Nu. Calculatorul oferă estimări orientative. Fluturașul real poate diferi din cauza deducerilor personale (variabile pe copii în întreținere), regularizărilor de impozit, concediilor medicale plătite parțial din CNAS, primelor, reținerilor executorești sau altor elemente specifice angajatorului tău.",
        ],
        [
          "Cum se calculează sporul de noapte conform legii?",
          "Conform art. 123 din Codul Muncii, angajații care lucrează minimum 3 ore noaptea (22:00–06:00) au dreptul la un spor de minimum 25% din salariul de bază. Formula: (Salariu brut ÷ ore lunare) × ore noapte × procent spor. Exemplu: 6.000 lei ÷ 168 ore × 80 ore noapte × 25% = 714 lei spor brut.",
        ],
        [
          "Bonurile de masă sunt impozabile?",
          "Nu, bonurile de masă acordate în limita valorii legale maxime (actualizată periodic) sunt scutite de CAS, CASS și impozit pe venit. Aceasta le face net mai avantajoase decât un salariu echivalent. Un bon de 40 lei ajunge integral la angajat, pe când un supliment salarial brut de 40 lei devine net doar ~23 lei.",
        ],
        [
          "Cum funcționează concediul medical pentru angajat?",
          "Primele 5 zile de concediu medical sunt plătite de angajator. Din ziua a 6-a, CNAS suportă indemnizația. Valoarea indemnizației = media zilnică din ultimele 6 luni × număr zile × procent (75% pentru boli obișnuite, 80% dacă ai peste 8 ani vechime, 100% pentru afecțiuni grave). Nu se acordă bonuri de masă pe zilele de concediu medical.",
        ],
        [
          "Dacă lucrez în zi de sărbătoare legală, ce drepturi am?",
          "Angajatorul trebuie fie să îți acorde zile libere compensatorii în 30 de zile, fie să plătească un spor de 100% din salariul de bază pentru orele lucrate. Dacă tura de noapte coincide cu o sărbătoare, sporurile se pot cumula. Verifică contractul colectiv de muncă pentru detalii specifice angajatorului tău.",
        ],
        [
          "Cum pot verifica dacă calculul meu este corect?",
          "Compară estimarea calculatorului cu fluturașul de salariu real și cu contractul individual de muncă. Verifică dacă procentele de CAS, CASS și impozit introduse în Reguli corespund celor reținute. Dacă există diferențe mari, consultați departamentul de resurse umane sau un contabil.",
        ],
      ],
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Detailed answers to the most common questions about net salary calculation in Romania.",
      items: [
        [
          "What percentages apply in 2026 for CAS, CASS and income tax?",
          "In 2026, the standard contributions are: CAS (pension) = 25% of gross salary, CASS (health) = 10% of gross salary, income tax = 10% of taxable base (gross minus CAS minus CASS, minus personal deduction if applicable). The total withheld can reach approximately 41–42% of gross for an employee without a personal deduction.",
        ],
        [
          "What is the minimum net salary in Romania in 2026?",
          "The minimum gross salary in 2026 is 4,050 RON. The estimated minimum net salary is approximately 2,363–2,370 RON, after deducting CAS (1,012.5 RON), CASS (405 RON) and income tax (~270 RON). Meal vouchers for worked days may be added on top.",
        ],
        [
          "Does the calculator provide exact values identical to the payslip?",
          "No. The calculator provides indicative estimates. The actual payslip may differ due to personal deductions (variable for dependents), tax regularizations, medical leave partially paid by CNAS, bonuses, enforcement deductions or other elements specific to your employer.",
        ],
        [
          "How is the night shift bonus calculated according to law?",
          "According to art. 123 of the Labour Code, employees working at least 3 hours at night (22:00–06:00) are entitled to a bonus of at least 25% of base salary. Formula: (Gross salary ÷ monthly hours) × night hours × bonus percentage. Example: 6,000 RON ÷ 168 hours × 80 night hours × 25% = 714 RON gross bonus.",
        ],
        [
          "Are meal vouchers taxable?",
          "No, meal vouchers granted within the legal maximum value (updated periodically) are exempt from CAS, CASS and income tax. This makes them net more advantageous than an equivalent salary. A 40 RON voucher reaches the employee in full, whereas a 40 RON gross salary supplement becomes only ~23 RON net.",
        ],
        [
          "How does medical leave work for an employee?",
          "The first 5 days of medical leave are paid by the employer. From day 6 onwards, CNAS covers the allowance. The allowance value = daily average from the last 6 months × number of days × percentage (75% for ordinary illnesses, 80% if over 8 years of service, 100% for serious conditions). No meal vouchers are granted for medical leave days.",
        ],
        [
          "If I work on a public holiday, what rights do I have?",
          "The employer must either grant you compensatory days off within 30 days, or pay a bonus of 100% of base salary for hours worked. If a night shift coincides with a public holiday, bonuses may be combined. Check the collective labour agreement for details specific to your employer.",
        ],
        [
          "How can I verify if my calculation is correct?",
          "Compare the calculator's estimate with your actual payslip and individual employment contract. Check that the CAS, CASS and income tax percentages entered in Rules match those withheld. If there are large discrepancies, consult your HR department or an accountant.",
        ],
      ],
    },
  }[lang];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-cyan-300">FAQ</p>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t.subtitle}</p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {t.items.map(([question, answer], index) => (
          <article
            key={question}
            className="group rounded-3xl border border-slate-700/80 bg-slate-900/55 p-6 leading-8 text-slate-200 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-slate-900/80 hover:shadow-cyan-950/30"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-cyan-200">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/30 to-transparent" />
            </div>
            <h2 className="mb-3 text-xl font-black leading-snug text-white transition group-hover:text-cyan-100">{question}</h2>
            <p className="text-[15px] leading-8 text-slate-300">{answer}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
