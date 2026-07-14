"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/lib/auth";
import { clearStoredSecurityState } from "@/lib/security-client";
import { useCurrentUser } from "@/lib/use-current-user";
import { useUI } from "@/lib/ui-context";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

const copy = {
  ro: {
    calculator: "Calculator",
    dashboard: "Panou",
    profiles: "Profiluri",
    company: "Companie",
    pricing: "Prețuri",
    assistant: "Asistent AI",
    guides: "Ghiduri",
    security: "Securitate",
    login: "Intră în cont",
    account: "Contul meu",
    logout: "Ieși",
    menu: "Meniu",
    legal: "Legal și încredere",
    privacy: "Confidențialitate",
    terms: "Termeni",
    cookies: "Cookies",
    retention: "Păstrarea datelor",
    aiPolicy: "Politica AI",
    dpa: "DPA pentru firme",
    status: "Platformă web securizată",
  },
  en: {
    calculator: "Calculator",
    dashboard: "Dashboard",
    profiles: "Profiles",
    company: "Company",
    pricing: "Pricing",
    assistant: "AI Assistant",
    guides: "Guides",
    security: "Security",
    login: "Sign in",
    account: "My account",
    logout: "Sign out",
    menu: "Menu",
    legal: "Legal and trust",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    retention: "Data retention",
    aiPolicy: "AI policy",
    dpa: "Business DPA",
    status: "Secure web platform",
  },
} as const;

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, theme, setLanguage, toggleTheme } = useUI();
  const { user, loading: userLoading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const t = copy[language];
  const isAuth = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isAuth) return <>{children}</>;

  const links = [
    ["/calculator-universal", t.calculator],
    ["/dashboard", t.dashboard],
    ["/profiles", t.profiles],
    ["/company", t.company],
    ["/pricing", t.pricing],
    ["/assistant", t.assistant],
  ] as const;

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      clearStoredSecurityState();
      await logoutUser();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-brand" aria-label="Calculator Salariu">
            <span className="site-brand-mark">✓</span>
            <span><strong>{language === "ro" ? "Calculator Salariu" : "Salary Calculator"}</strong><small>WEB · ROMÂNIA</small></span>
          </Link>

          <nav className={`site-nav ${open ? "site-nav-open" : ""}`} aria-label={t.menu}>
            {links.map(([href, label]) => (
              <Link key={href} href={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>

          <div className="site-controls">
            <div className="segmented" aria-label="Language">
              <button className={language === "ro" ? "active" : ""} onClick={() => setLanguage("ro")}>RO</button>
              <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
            </div>
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === "dark" ? "Light theme" : "Dark theme"}>{theme === "dark" ? "☀" : "☾"}</button>
            {userLoading ? (
              <span className="header-auth-placeholder" aria-hidden="true">•••</span>
            ) : user ? (
              <div className="header-account-group">
                <Link href="/dashboard" className="header-account" title={user.email || t.account}>
                  <span className="header-account-dot" />
                  <span>{t.account}</span>
                </Link>
                <button className="header-logout" type="button" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "…" : t.logout}</button>
              </div>
            ) : (
              <Link href="/login" className="header-login">{t.login}</Link>
            )}
            <button className="mobile-menu" onClick={() => setOpen((value) => !value)} aria-expanded={open}>☰</button>
          </div>
        </div>
      </header>

      <div className="site-content">{children}</div>

      <footer className="site-footer">
        <div className="site-footer-grid">
          <div>
            <div className="site-brand footer-brand"><span className="site-brand-mark">✓</span><span><strong>{language === "ro" ? "Calculator Salariu" : "Salary Calculator"}</strong><small>{t.status}</small></span></div>
            <p>{language === "ro" ? "Calcule salariale configurabile pentru persoane și companii. Rezultatele personalizate sunt simulări și trebuie verificate înainte de utilizare oficială." : "Configurable payroll calculations for individuals and companies. Custom results are simulations and must be verified before official use."}</p>
          </div>
          <div><h3>{t.legal}</h3><Link href="/privacy">{t.privacy}</Link><Link href="/terms">{t.terms}</Link><Link href="/cookies">{t.cookies}</Link><Link href="/retention">{t.retention}</Link></div>
          <div><h3>Trust</h3><Link href="/security">{t.security}</Link><Link href="/ai-policy">{t.aiPolicy}</Link><Link href="/dpa">{t.dpa}</Link><Link href="/subprocessors">Subprocessors</Link></div>
          <div><h3>{t.guides}</h3><Link href="/calculator-brut-net">Brut ↔ Net</Link><Link href="/program-in-ture">{language === "ro" ? "Program în ture" : "Shift work"}</Link><Link href="/concediu-medical">{language === "ro" ? "Concediu medical" : "Medical leave"}</Link><Link href="/faq">FAQ</Link></div>
        </div>
        <div className="site-footer-bottom">© 2026 Calculator Salariu · v2 web</div>
      </footer>
    </div>
  );
}
