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
      title: "Bonuri de masă 2026",
      subtitle:
        "Valoarea maximă a bonului de masă în 2026, cum se acordă, impozitarea lor și impactul asupra venitului lunar.",
      sections: [
        {
          title: "Valoarea maximă neimpozabilă a bonului de masă în 2026",
          body: "Valoarea nominală maximă a unui bon de masă pentru care angajatorul poate beneficia de deducere fiscală este actualizată periodic prin hotărâre de guvern. În 2025, valoarea era de 40 lei/zi. Pentru 2026, verifică Monitorul Oficial pentru actualizare. Angajatorul poate acorda o valoare mai mică, dar nu poate depăși pragul legal fără consecințe fiscale.",
        },
        {
          title: "Cum se calculează bonurile lunare",
          body: "Bonurile se acordă strict pentru zilele în care angajatul a fost prezent la muncă. Nu se acordă bonuri pentru zilele de concediu de odihnă, concediu medical, sărbători legale sau absențe nemotivate. Formula: Total bonuri = Valoare bon pe zi × Număr zile lucrate efectiv. Exemplu: 40 lei × 21 zile = 840 lei/lună.",
        },
        {
          title: "Fiscalitatea bonurilor de masă",
          body: "Bonurile de masă acordate în limita valorii legale sunt scutite de CAS, CASS și impozit pe venit pentru angajat. Angajatorul le deduce ca și cheltuieli de personal și nu plătește contribuții sociale pe valoarea bonurilor. Aceasta le face mai avantajoase fiscal decât o creștere salarială echivalentă.",
        },
        {
          title: "Comparație: bon de masă vs. salariu echivalent",
          body: "Un bon de 40 lei ajunge integral la angajat. Un supliment salarial brut de 40 lei devine net aproximativ 23,4 lei (după CAS 25%, CASS 10%, impozit 10%). Astfel, 840 lei/lună în bonuri echivalează cu aproximativ 1.435 lei brut în salariu. Bonurile de masă sunt unul dintre cele mai eficiente beneficii oferite de angajator.",
        },
        {
          title: "Cum urmărești bonurile în calculator",
          body: "În pagina Reguli, introdu valoarea bonului pe zi conform contractului tău. Calculatorul numără automat zilele marcate ca tură (Morning, After, Night) și calculează totalul bonurilor pentru luna respectivă. Zilele marcate ca Medical, Vacation sau Absent nu generează bonuri.",
        },
        {
          title: "Bonuri și programul în ture",
          body: "Pentru angajații cu program în ture, bonul de masă se acordă per tură lucrată, indiferent dacă tura este de zi sau de noapte. O tură de noapte care începe luni și se termină marți poate genera un singur bon sau două, în funcție de regulamentul intern al angajatorului. Verifică politica companiei tale.",
        },
      ],
    },
    en: {
      label: "Romanian salary guide",
      title: "Meal vouchers 2026",
      subtitle:
        "Maximum meal voucher value in 2026, how they are granted, their taxation and impact on monthly income.",
      sections: [
        {
          title: "Maximum non-taxable meal voucher value in 2026",
          body: "The maximum nominal value of a meal voucher for which the employer can benefit from a tax deduction is periodically updated by government decision. In 2025, the value was 40 RON/day. For 2026, check the Official Gazette for updates. The employer may grant a lower value, but cannot exceed the legal threshold without tax consequences.",
        },
        {
          title: "How monthly vouchers are calculated",
          body: "Vouchers are granted strictly for days when the employee was present at work. No vouchers are granted for days of annual leave, medical leave, public holidays or unjustified absences. Formula: Total vouchers = Voucher value per day × Number of days actually worked. Example: 40 RON × 21 days = 840 RON/month.",
        },
        {
          title: "Taxation of meal vouchers",
          body: "Meal vouchers granted within the legal value are exempt from CAS, CASS and income tax for the employee. The employer deducts them as personnel expenses and pays no social contributions on the voucher value. This makes them more fiscally advantageous than an equivalent salary increase.",
        },
        {
          title: "Comparison: meal voucher vs. equivalent salary",
          body: "A 40 RON voucher reaches the employee in full. A 40 RON gross salary supplement becomes approximately 23.4 RON net (after CAS 25%, CASS 10%, income tax 10%). Thus, 840 RON/month in vouchers is equivalent to approximately 1,435 RON gross in salary. Meal vouchers are one of the most fiscally efficient benefits offered by employers.",
        },
        {
          title: "How to track vouchers in the calculator",
          body: "On the Rules page, enter the daily voucher value according to your contract. The calculator automatically counts days marked as shifts (Morning, After, Night) and calculates the total vouchers for that month. Days marked as Medical, Vacation or Absent do not generate vouchers.",
        },
        {
          title: "Vouchers and shift schedules",
          body: "For shift employees, the meal voucher is granted per worked shift, regardless of whether the shift is day or night. A night shift starting Monday and ending Tuesday may generate one or two vouchers, depending on the employer's internal rules. Check your company's policy.",
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
