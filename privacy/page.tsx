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

export default function PrivacyPage() {
  const lang = usePageLang();

  const t = {
    ro: {
      title: "Politica de confidențialitate",
      intro:
        "Calculator Salariu colectează doar datele necesare pentru funcționarea aplicației: autentificare, salvarea setărilor salariale, istoricul de calcul și preferințele utilizatorului.",
      servicesTitle: "Servicii utilizate",
      services:
        "Site-ul poate utiliza Firebase pentru autentificare și stocare, Google Analytics pentru analiză agregată a traficului și Google AdSense pentru afișarea reclamelor, dacă acestea sunt activate.",
      cookiesTitle: "Cookie-uri și publicitate",
      cookies:
        "Google și partenerii săi pot folosi cookie-uri sau identificatori similari pentru măsurarea performanței și, unde este cazul, pentru personalizarea reclamelor. Utilizatorii pot controla cookie-urile din setările browserului.",
      salaryTitle: "Date salariale",
      salary:
        "Valorile introduse în aplicație sunt folosite pentru estimări și pot fi salvate în contul tău pentru sincronizare. Nu vindem datele utilizatorilor și nu publicăm informații salariale personale.",
      deleteTitle: "Ștergerea datelor",
      delete:
        "Poți solicita sau folosi ștergerea automată a contului și a datelor asociate din pagina dedicată ștergerii contului. Unele informații pot rămâne temporar în backup-uri tehnice, conform ciclurilor normale de securitate.",
      contact: "Pentru întrebări, folosește pagina Contact.",
    },
    en: {
      title: "Privacy Policy",
      intro:
        "Salary Calculator collects only the data required for the app to work: authentication, saved salary settings, calculation history and user preferences.",
      servicesTitle: "Services used",
      services:
        "The site may use Firebase for authentication and storage, Google Analytics for aggregated traffic analysis and Google AdSense for displaying ads if they are enabled.",
      cookiesTitle: "Cookies and advertising",
      cookies:
        "Google and its partners may use cookies or similar identifiers for performance measurement and, where applicable, ad personalization. Users can control cookies from their browser settings.",
      salaryTitle: "Salary data",
      salary:
        "Values entered in the app are used for estimates and may be saved to your account for synchronization. We do not sell user data and we do not publish personal salary information.",
      deleteTitle: "Data deletion",
      delete:
        "You can request or use automatic deletion of your account and associated data from the dedicated account deletion page. Some information may remain temporarily in technical backups according to normal security cycles.",
      contact: "For questions, use the Contact page.",
    },
  }[lang];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-100">
      <h1 className="mb-6 text-4xl font-bold">{t.title}</h1>
      <div className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 leading-8 text-slate-200">
        <p>{t.intro}</p>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.servicesTitle}</h2>
          <p>{t.services}</p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.cookiesTitle}</h2>
          <p>{t.cookies}</p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.salaryTitle}</h2>
          <p>{t.salary}</p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.deleteTitle}</h2>
          <p>{t.delete}</p>
        </section>

        <p>{t.contact}</p>
      </div>
    </main>
  );
}
