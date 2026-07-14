"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserAccountDocument, loginWithEmail, mapAuthError, logoutUser } from "@/lib/auth";
import { clearStoredSecurityState, registerBrowserSession } from "@/lib/security-client";
import styles from "./login.module.css";

type IconProps = { className?: string };
type Lang = "RO" | "EN";
type Theme = "dark" | "light";
type Shift = "M" | "A" | "N" | "L" | "CO" | "CM" | "ANV" | "ABS";

type Translation = {
  brand: string;
  country: string;
  homeAria: string;
  languageAria: string;
  themeToLight: string;
  themeToDark: string;
  secureAuth: string;
  welcome: string;
  subtitle: string;
  freeCalculation: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  forgotPassword: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  remember: string;
  signIn: string;
  orContinue: string;
  google: string;
  googleLoading: string;
  noAccount: string;
  createFree: string;
  secureConnection: string;
  privacy: string;
  terms: string;
  security: string;
  legalAria: string;
  showcaseAria: string;
  smartPayroll: string;
  headline1: string;
  headline2: string;
  showcaseDescription: string;
  feature1: string;
  feature2: string;
  feature3: string;
  nightHours: string;
  fortyHours: string;
  bonusApplied: string;
  aiAssistant: string;
  aiQuote: string;
  payrollCalendar: string;
  month: string;
  previousMonth: string;
  nextMonth: string;
  calculationUpdated: string;
  scheduleConfigured: string;
  protectedData: string;
  versionedCalculations: string;
  controlledAi: string;
  weekdays: string[];
  shiftLabels: Record<Shift, string>;
};

const translations: Record<Lang, Translation> = {
  RO: {
    brand: "Calculator Salariu",
    country: "România",
    homeAria: "Calculator Salariu - Acasă",
    languageAria: "Schimbă limba",
    themeToLight: "Activează tema luminoasă",
    themeToDark: "Activează tema întunecată",
    secureAuth: "Autentificare securizată",
    welcome: "Bine ai revenit",
    subtitle: "Intră în cont pentru a continua calculele, istoricul și setările tale salariale.",
    freeCalculation: "Configurezi gratuit. Fiecare calcul complet folosește 1 credit sau este inclus în abonament",
    email: "Adresă de email",
    emailPlaceholder: "nume@exemplu.ro",
    password: "Parolă",
    forgotPassword: "Ai uitat parola?",
    passwordPlaceholder: "Introdu parola",
    showPassword: "Arată parola",
    hidePassword: "Ascunde parola",
    remember: "Ține-mă autentificat pe acest dispozitiv",
    signIn: "Intră în cont",
    orContinue: "sau continuă cu",
    google: "Continuă cu Google",
    googleLoading: "Se conectează...",
    noAccount: "Nu ai încă un cont?",
    createFree: "Creează unul gratuit",
    secureConnection: "Datele contului sunt transmise prin conexiune securizată.",
    privacy: "Confidențialitate",
    terms: "Termeni",
    security: "Securitate",
    legalAria: "Linkuri legale",
    showcaseAria: "Previzualizare Calculator Salariu",
    smartPayroll: "Calcul salarial inteligent",
    headline1: "Programul tău.",
    headline2: "Salariul explicat clar.",
    showcaseDescription: "Ture, sporuri, concedii, bonusuri și taxe într-un singur loc, cu istoric lunar și explicații ușor de verificat.",
    feature1: "Orice program: normal, part-time sau ture personalizate",
    feature2: "Reguli și procente configurabile pentru fiecare profil",
    feature3: "Istoric, comparații și asistent AI pentru explicații",
    nightHours: "Ore de noapte",
    fortyHours: "40 ore",
    bonusApplied: "Spor aplicat: 25%",
    aiAssistant: "Asistent Salariu AI",
    aiQuote: "„Am configurat tura 23:00–07:00 cu spor pentru toate cele 8 ore.”",
    payrollCalendar: "CALENDAR SALARIAL",
    month: "Iulie 2026",
    previousMonth: "Luna anterioară",
    nextMonth: "Luna următoare",
    calculationUpdated: "Calcul actualizat",
    scheduleConfigured: "Program lunar configurat",
    protectedData: "Date protejate",
    versionedCalculations: "Calcule versionate",
    controlledAi: "AI controlat de utilizator",
    weekdays: ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"],
    shiftLabels: { M: "M", A: "A", N: "N", L: "L", CO: "CO", CM: "CM", ANV: "ANV", ABS: "ABS" },
  },
  EN: {
    brand: "Salary Calculator",
    country: "Romania",
    homeAria: "Salary Calculator - Home",
    languageAria: "Change language",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    secureAuth: "Secure sign-in",
    welcome: "Welcome back",
    subtitle: "Sign in to continue your calculations, history and payroll settings.",
    freeCalculation: "Configure for free. Each complete calculation uses 1 credit or is included in your subscription",
    email: "Email address",
    emailPlaceholder: "name@example.com",
    password: "Password",
    forgotPassword: "Forgot your password?",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    remember: "Keep me signed in on this device",
    signIn: "Sign in",
    orContinue: "or continue with",
    google: "Continue with Google",
    googleLoading: "Signing in...",
    noAccount: "Do not have an account yet?",
    createFree: "Create one for free",
    secureConnection: "Your account data is transmitted through a secure connection.",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    legalAria: "Legal links",
    showcaseAria: "Salary Calculator preview",
    smartPayroll: "Smart payroll calculation",
    headline1: "Your schedule.",
    headline2: "Your salary explained clearly.",
    showcaseDescription: "Shifts, bonuses, leave, rewards and taxes in one place, with monthly history and explanations that are easy to verify.",
    feature1: "Any schedule: standard, part-time or custom shifts",
    feature2: "Configurable rules and percentages for every profile",
    feature3: "History, comparisons and an AI assistant for explanations",
    nightHours: "Night hours",
    fortyHours: "40 hours",
    bonusApplied: "Bonus applied: 25%",
    aiAssistant: "Payroll AI Assistant",
    aiQuote: "“I configured the 23:00–07:00 shift with a night bonus for all 8 hours.”",
    payrollCalendar: "PAYROLL CALENDAR",
    month: "July 2026",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    calculationUpdated: "Calculation updated",
    scheduleConfigured: "Monthly schedule configured",
    protectedData: "Protected data",
    versionedCalculations: "Versioned calculations",
    controlledAi: "User-controlled AI",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    shiftLabels: { M: "M", A: "A", N: "N", L: "OFF", CO: "AL", CM: "SL", ANV: "BDAY", ABS: "ABS" },
  },
};

const calendarDays: Array<{ day: number; shift?: Shift; muted?: boolean }> = [
  { day: 29, muted: true }, { day: 30, muted: true }, { day: 1, shift: "M" },
  { day: 2, shift: "M" }, { day: 3, shift: "A" }, { day: 4, shift: "A" },
  { day: 5, shift: "N" }, { day: 6, shift: "N" }, { day: 7, shift: "L" },
  { day: 8, shift: "L" }, { day: 9, shift: "CO" }, { day: 10, shift: "CO" },
  { day: 11, shift: "M" }, { day: 12, shift: "A" }, { day: 13, shift: "N" },
  { day: 14, shift: "L" }, { day: 15, shift: "ANV" }, { day: 16, shift: "M" },
  { day: 17, shift: "A" }, { day: 18, shift: "N" }, { day: 19, shift: "L" },
  { day: 20, shift: "M" }, { day: 21, shift: "A" }, { day: 22, shift: "N" },
  { day: 23, shift: "L" }, { day: 24, shift: "CM" }, { day: 25, shift: "CM" },
  { day: 26, shift: "L" }, { day: 27, shift: "M" }, { day: 28, shift: "A" },
  { day: 29, shift: "N" }, { day: 30, shift: "ABS" }, { day: 31, shift: "L" },
  { day: 1, muted: true }, { day: 2, muted: true },
];

function mapAuthErrorEnglish(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  switch (code) {
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password": return "The email address or password is incorrect.";
    case "auth/too-many-requests": return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user": return "The Google sign-in window was closed before completion.";
    case "auth/network-request-failed": return "The connection failed. Check your internet connection and try again.";
    default: return "Sign-in could not be completed. Please try again.";
  }
}

function LogoMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="13" fill="url(#logoGradient)" />
      <path d="M15 15.5h18a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3v-15a3 3 0 0 1 3-3Z" stroke="white" strokeWidth="2.2" />
      <path d="M12 22h24" stroke="white" strokeWidth="2.2" />
      <path d="M18 12v7M30 12v7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m18.5 29.2 3.2 3.2 7.8-8.3" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <defs><linearGradient id="logoGradient" x1="7" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE" /><stop offset="0.55" stopColor="#3B82F6" /><stop offset="1" stopColor="#8B5CF6" /></linearGradient></defs>
    </svg>
  );
}

function MailIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.8" /><path d="m5 7.5 7 5 7-5" stroke="currentColor" strokeWidth="1.8" /></svg>; }
function LockIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 10V7.5a3.5 3.5 0 1 1 7 0V10" stroke="currentColor" strokeWidth="1.8" /></svg>; }
function ArrowIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>; }
function ShieldIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 7 3v5.2c0 4.4-2.8 8.2-7 9.8-4.2-1.6-7-5.4-7-9.8V6l7-3Z" stroke="currentColor" strokeWidth="1.8" /><path d="m8.8 12 2.1 2.1 4.6-4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }
function SparklesIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c.6 3 2.4 4.8 5.4 5.4C14.4 9 12.6 10.8 12 13.8 11.4 10.8 9.6 9 6.6 8.4 9.6 7.8 11.4 6 12 3Z" stroke="currentColor" strokeWidth="1.6" /><path d="M18.2 14.2c.3 1.8 1.4 2.9 3.2 3.2-1.8.3-2.9 1.4-3.2 3.2-.3-1.8-1.4-2.9-3.2-3.2 1.8-.3 2.9-1.4 3.2-3.2ZM5.2 14.1c.2 1.1.9 1.8 2 2-1.1.2-1.8.9-2 2-.2-1.1-.9-1.8-2-2 1.1-.2 1.8-.9 2-2Z" stroke="currentColor" strokeWidth="1.5" /></svg>; }
function CheckIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function SunIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>; }
function MoonIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.1A8.4 8.4 0 0 1 8.9 4a8.5 8.5 0 1 0 11.1 11.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>; }
function EyeIcon({ className, hidden }: IconProps & { hidden?: boolean }) { return hidden ? <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 4 16 16M10.5 6.2A9.9 9.9 0 0 1 12 6c5 0 8 6 8 6a15.2 15.2 0 0 1-2.2 3.2M8.2 7.4C5.5 9 4 12 4 12s3 6 8 6c1.2 0 2.3-.3 3.2-.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> : <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.8"/></svg>; }
function GoogleIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.7 4.7 0 0 1-2 3.1V20h3.3c2-1.8 2.9-4.5 2.9-7.8Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.4H3a10 10 0 0 0 0 9.2l3.4-2.7Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0 0 3 7.4l3.4 2.7C7.2 7.8 9.4 6 12 6Z"/></svg>; }
function Spinner() { return <span className={styles.spinner} aria-hidden="true" />; }
function Feature({ children }: { children: ReactNode }) { return <li><span className={styles.featureIcon}><CheckIcon /></span><span>{children}</span></li>; }

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<unknown>(null);
  const [lang, setLang] = useState<Lang>("RO");
  const [theme, setTheme] = useState<Theme>("dark");
  const t = translations[lang];

  useEffect(() => {
    const savedLang = window.localStorage.getItem("salary-calculator-language");
    if (savedLang === "RO" || savedLang === "EN") setLang(savedLang);
    const savedTheme = window.localStorage.getItem("salary-calculator-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: light)").matches) setTheme("light");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("salary-calculator-language", lang);
    document.documentElement.lang = lang === "RO" ? "ro" : "en";
    document.title = `${t.brand} — ${t.welcome}`;
  }, [lang, t.brand, t.welcome]);

  useEffect(() => {
    window.localStorage.setItem("salary-calculator-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6 && !loading && !googleLoading, [email, password, loading, googleLoading]);
  const errorMessage = authError ? (lang === "RO" ? mapAuthError(authError) : mapAuthErrorEnglish(authError)) : "";

  async function preparePersistence() { await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence); }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!canSubmit) return;
    setAuthError(null); setLoading(true);
    try {
      await preparePersistence();
      const credential = await loginWithEmail(email.trim(), password);
      await ensureUserAccountDocument(credential.user);
      await registerBrowserSession();
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      clearStoredSecurityState();
      try { await logoutUser(); } catch {}
      setAuthError(error);
    }
    finally { setLoading(false); }
  }
  async function handleGoogleLogin() {
    setAuthError(null); setGoogleLoading(true);
    try {
      await preparePersistence();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      await ensureUserAccountDocument(credential.user);
      await registerBrowserSession();
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      clearStoredSecurityState();
      try { await logoutUser(); } catch {}
      setAuthError(error);
    }
    finally { setGoogleLoading(false); }
  }

  return (
    <main className={styles.page} data-theme={theme} data-language={lang}>
      <div className={styles.ambientOne} /><div className={styles.ambientTwo} /><div className={styles.gridTexture} />
      <div className={styles.shell}>
        <section className={styles.formPanel} aria-labelledby="login-title">
          <header className={styles.topBar}>
            <Link href="/" className={styles.brand} aria-label={t.homeAria}>
              <LogoMark className={styles.logo} />
              <span className={styles.brandText}><strong>{t.brand}</strong><small>{t.country}</small></span>
            </Link>
            <div className={styles.topControls}>
              <div className={styles.languageSwitch} aria-label={t.languageAria}>
                <button type="button" className={lang === "RO" ? styles.languageActive : ""} onClick={() => setLang("RO")} aria-pressed={lang === "RO"}>RO</button>
                <button type="button" className={lang === "EN" ? styles.languageActive : ""} onClick={() => setLang("EN")} aria-pressed={lang === "EN"}>EN</button>
              </div>
              <button type="button" className={styles.themeToggle} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? t.themeToLight : t.themeToDark} title={theme === "dark" ? t.themeToLight : t.themeToDark}>
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </header>

          <div className={styles.formWrap}>
            <div className={styles.eyebrow}><ShieldIcon />{t.secureAuth}</div>
            <h1 id="login-title">{t.welcome}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
            <div className={styles.trialNote}><span className={styles.trialDot} />{t.freeCalculation}</div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="login-email">{t.email}</label>
                <div className={styles.inputWrap}><MailIcon className={styles.inputIcon} /><input id="login-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder={t.emailPlaceholder} value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(authError)} required /></div>
              </div>
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}><label htmlFor="login-password">{t.password}</label><Link href="/forgot-password">{t.forgotPassword}</Link></div>
                <div className={styles.inputWrap}><LockIcon className={styles.inputIcon} /><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={t.passwordPlaceholder} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(authError)} required /><button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? t.hidePassword : t.showPassword}><EyeIcon hidden={showPassword} /></button></div>
              </div>
              <label className={styles.rememberRow}><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span className={styles.customCheckbox}><CheckIcon /></span><span>{t.remember}</span></label>
              {errorMessage && <div className={styles.errorBox} role="alert"><span>!</span><p>{errorMessage}</p></div>}
              <button type="submit" className={styles.primaryButton} disabled={!canSubmit}>{loading ? <Spinner /> : <span>{t.signIn}</span>}{!loading && <ArrowIcon />}</button>
            </form>

            <div className={styles.divider}><span>{t.orContinue}</span></div>
            <button type="button" className={styles.googleButton} onClick={handleGoogleLogin} disabled={loading || googleLoading}>{googleLoading ? <Spinner /> : <GoogleIcon />}<span>{googleLoading ? t.googleLoading : t.google}</span></button>
            <p className={styles.registerText}>{t.noAccount} <Link href="/register">{t.createFree}</Link></p>
            <div className={styles.securityLine}><ShieldIcon /><span>{t.secureConnection}</span></div>
          </div>

          <footer className={styles.formFooter}><span>© 2026 {t.brand}</span><nav aria-label={t.legalAria}><Link href="/privacy">{t.privacy}</Link><Link href="/terms">{t.terms}</Link><Link href="/security">{t.security}</Link></nav></footer>
        </section>

        <section className={styles.showcasePanel} aria-label={t.showcaseAria}>
          <div className={styles.showcaseContent}>
            <div className={styles.showcaseCopy}>
              <div className={styles.showcasePill}><SparklesIcon />{t.smartPayroll}</div>
              <h2>{t.headline1}<br />{t.headline2}</h2>
              <p>{t.showcaseDescription}</p>
              <ul className={styles.featureList}><Feature>{t.feature1}</Feature><Feature>{t.feature2}</Feature><Feature>{t.feature3}</Feature></ul>
            </div>
            <div className={styles.productStage}>
              <div className={styles.stageGlow} />
              <div className={`${styles.floatingCard} ${styles.hoursCard}`}><div className={styles.iconTile}>N</div><div><span>{t.nightHours}</span><strong>{t.fortyHours}</strong><small>{t.bonusApplied}</small></div></div>
              <div className={`${styles.floatingCard} ${styles.aiCard}`}><div className={styles.aiAvatar}><SparklesIcon /></div><div><span>{t.aiAssistant}</span><p>{t.aiQuote}</p></div></div>
              <div className={styles.dashboardCard}>
                <div className={styles.dashboardHeader}><div><small>{t.payrollCalendar}</small><strong>{t.month}</strong></div><div className={styles.dashboardActions}><button type="button" aria-label={t.previousMonth}>‹</button><button type="button" aria-label={t.nextMonth}>›</button></div></div>
                <div className={styles.weekHeader}>{t.weekdays.map((day) => <span key={day}>{day}</span>)}</div>
                <div className={styles.calendarGrid}>{calendarDays.map((item, index) => <div key={`${item.day}-${index}`} className={`${styles.calendarCell} ${item.muted ? styles.mutedDay : ""}`}><span className={styles.dayNumber}>{item.day}</span>{item.shift && <span className={`${styles.shiftBadge} ${styles[`shift${item.shift}`]}`}>{t.shiftLabels[item.shift]}</span>}</div>)}</div>
                <div className={styles.dashboardFooter}><div><span className={styles.statusDot} />{t.calculationUpdated}</div><strong>{t.scheduleConfigured}</strong></div>
              </div>
            </div>
            <div className={styles.trustRow}><span><ShieldIcon />{t.protectedData}</span><span><CheckIcon />{t.versionedCalculations}</span><span><SparklesIcon />{t.controlledAi}</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
