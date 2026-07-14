"use client";

import Link from "next/link";
import { useUI } from "@/lib/ui-context";
import styles from "./authSimple.module.css";

export default function AuthSimpleShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { language, theme, setLanguage, toggleTheme } = useUI();
  return (
    <main className={styles.page}>
      <div className={styles.glowOne} /><div className={styles.glowTwo} />
      <section className={styles.card}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}><span>✓</span><div><strong>{language === "ro" ? "Calculator Salariu" : "Salary Calculator"}</strong><small>WEB · ROMÂNIA</small></div></Link>
          <div className={styles.controls}>
            <button className={language === "ro" ? styles.active : ""} onClick={() => setLanguage("ro")}>RO</button>
            <button className={language === "en" ? styles.active : ""} onClick={() => setLanguage("en")}>EN</button>
            <button onClick={toggleTheme} aria-label="Theme">{theme === "dark" ? "☀" : "☾"}</button>
          </div>
        </header>
        <div className={styles.content}>
          <div className={styles.badge}>{language === "ro" ? "Cont securizat" : "Secure account"}</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
        <footer><Link href="/privacy">{language === "ro" ? "Confidențialitate" : "Privacy"}</Link><Link href="/terms">{language === "ro" ? "Termeni" : "Terms"}</Link><Link href="/security">{language === "ro" ? "Securitate" : "Security"}</Link></footer>
      </section>
    </main>
  );
}
