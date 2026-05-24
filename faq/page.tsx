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

export default function FAQPage() {
  const lang = usePageLang();

  const t = {
    ro: {
      title: "Întrebări frecvente",
      items: [
        ["Calculatorul oferă valori exacte?", "Rezultatele sunt estimative și pot varia în funcție de contract, sporuri sau taxe."],
        ["Cum se calculează sporul de noapte?", "Sporul de noapte se calculează în funcție de orele lucrate în intervalul legal și procentul stabilit de angajator."],
        ["Pot calcula ture de weekend și sărbători?", "Da. Platforma permite estimarea turelor de weekend și a sărbătorilor legale."],
        ["Datele mele sunt stocate?", "Datele pot fi stocate local sau în contul utilizatorului pentru sincronizare și istoric."],
        ["Cum îmi pot șterge contul?", "Există o pagină dedicată pentru ștergerea automată a contului și a datelor asociate."],
      ],
    },
    en: {
      title: "Frequently Asked Questions",
      items: [
        ["Does the calculator provide exact values?", "Results are estimates and may vary depending on contract, bonuses or taxes."],
        ["How is the night bonus calculated?", "The night bonus is calculated based on worked hours in the applicable interval and the percentage set by the employer."],
        ["Can I calculate weekend and holiday shifts?", "Yes. The platform supports estimates for weekend shifts and legal holidays."],
        ["Is my data stored?", "Data may be stored locally or in the user account for synchronization and history."],
        ["How can I delete my account?", "There is a dedicated page for automatic deletion of the account and associated data."],
      ],
    },
  }[lang];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-200">
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>

      <div className="space-y-6">
        {t.items.map(([question, answer]) => (
          <div key={question} className="border border-gray-700 rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-2">{question}</h2>
            <p className="text-gray-300">{answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
