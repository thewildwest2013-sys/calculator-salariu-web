"use client";

import Link from "next/link";
import { useUI } from "@/lib/ui-context";

const content = {
  ro: {
    kicker: "Platformă salarială web",
    title: "De la programul de lucru la un salariu explicat clar.",
    subtitle: "Calculează program normal, part-time, ture, sporuri, concedii și absențe. Păstrează istoric personal sau gestionează angajații unei firme într-un singur spațiu.",
    start: "Începe calculul",
    account: "Creează cont gratuit",
    free: "Primul calcul lunar complet este gratuit.",
    simpleTitle: "Calculator universal",
    simpleBody: "Program standard, ture configurabile, rotații și zile speciale într-un calendar ușor de folosit.",
    profilesTitle: "Profiluri și istoric",
    profilesBody: "Fiecare lună rămâne salvată cu regulile și valorile folosite, fără să se modifice retroactiv.",
    companyTitle: "Spațiu pentru firme",
    companyBody: "Angajați, administratori cu roluri separate, reguli comune, calcule în masă și audit al modificărilor.",
    aiTitle: "Asistent AI controlat",
    aiBody: "Descrii programul în cuvinte, primești o propunere structurată și confirmi înainte ca aplicația să salveze ceva.",
    trusted: "Motorul matematic face calculele. AI-ul doar configurează și explică.",
    pricing: "Vezi planurile",
  },
  en: {
    kicker: "Web payroll platform",
    title: "From work schedule to a clearly explained salary.",
    subtitle: "Calculate standard schedules, part-time work, shifts, bonuses, leave and absences. Keep personal history or manage company employees in one workspace.",
    start: "Start calculation",
    account: "Create free account",
    free: "Your first complete monthly calculation is free.",
    simpleTitle: "Universal calculator",
    simpleBody: "Standard schedules, configurable shifts, rotations and special days in an easy-to-use calendar.",
    profilesTitle: "Profiles and history",
    profilesBody: "Each month keeps the exact rules and values used, without retrospective changes.",
    companyTitle: "Company workspace",
    companyBody: "Employees, separate administrator roles, shared rules, bulk calculations and change auditing.",
    aiTitle: "Controlled AI assistant",
    aiBody: "Describe a schedule in plain language, review a structured proposal and confirm before anything is saved.",
    trusted: "The deterministic engine performs calculations. AI only configures and explains.",
    pricing: "View plans",
  },
} as const;

export default function HomePage() {
  const { language } = useUI();
  const t = content[language];

  return (
    <main className="platform-page">
      <section className="platform-hero home-hero">
        <div className="platform-kicker">{t.kicker}</div>
        <h1 className="platform-title">{t.title}</h1>
        <p className="platform-subtitle">{t.subtitle}</p>
        <div className="home-actions">
          <Link className="platform-button" href="/calculator-universal">{t.start}</Link>
          <Link className="platform-button secondary" href="/register">{t.account}</Link>
          <Link className="home-text-link" href="/pricing">{t.pricing} →</Link>
        </div>
        <div className="home-free-note"><span>✓</span>{t.free}</div>
      </section>

      <section className="platform-grid" aria-label="Platform features">
        <article className="platform-card span-6"><span className="feature-icon">▦</span><h2>{t.simpleTitle}</h2><p>{t.simpleBody}</p><Link href="/calculator-universal">{t.start} →</Link></article>
        <article className="platform-card span-6"><span className="feature-icon">◫</span><h2>{t.profilesTitle}</h2><p>{t.profilesBody}</p><Link href="/profiles">{language === "ro" ? "Deschide profilurile" : "Open profiles"} →</Link></article>
        <article className="platform-card span-6"><span className="feature-icon">⌂</span><h2>{t.companyTitle}</h2><p>{t.companyBody}</p><Link href="/company">{language === "ro" ? "Vezi modul Business" : "View Business mode"} →</Link></article>
        <article className="platform-card span-6"><span className="feature-icon">✦</span><h2>{t.aiTitle}</h2><p>{t.aiBody}</p><Link href="/assistant">{language === "ro" ? "Deschide asistentul" : "Open assistant"} →</Link></article>
      </section>

      <section className="home-trust-strip"><strong>{t.trusted}</strong><Link href="/trust">{language === "ro" ? "Cum protejăm datele" : "How data is protected"} →</Link></section>
    </main>
  );
}
