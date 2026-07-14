"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ro" | "en";
export type AppTheme = "dark" | "light";

type UIContextValue = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

const LANGUAGE_KEY = "calculator-salariu-lang";
const THEME_KEY = "calculator-salariu-theme";

function initialTheme(): AppTheme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(THEME_KEY) || window.localStorage.getItem("salary-calculator-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function initialLanguage(): AppLanguage {
  if (typeof window === "undefined") return "ro";
  const saved = window.localStorage.getItem(LANGUAGE_KEY) || window.localStorage.getItem("salary-calculator-language");
  if (saved === "en" || saved === "EN") return "en";
  return "ro";
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<AppLanguage>("ro");
  const [theme, updateTheme] = useState<AppTheme>("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      updateLanguage(initialLanguage());
      updateTheme(initialTheme());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem("salary-calculator-theme", theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    window.localStorage.setItem(LANGUAGE_KEY, language);
    window.localStorage.setItem("salary-calculator-language", language.toUpperCase());
    window.dispatchEvent(new CustomEvent("calculator-salariu-lang-change", { detail: language }));
  }, [language, hydrated]);

  const setLanguage = useCallback((next: AppLanguage) => updateLanguage(next), []);
  const setTheme = useCallback((next: AppTheme) => updateTheme(next), []);
  const toggleTheme = useCallback(() => updateTheme((current) => current === "dark" ? "light" : "dark"), []);

  const value = useMemo(() => ({ language, theme, setLanguage, setTheme, toggleTheme }), [language, theme, setLanguage, setTheme, toggleTheme]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const value = useContext(UIContext);
  if (!value) throw new Error("useUI must be used inside UIProvider");
  return value;
}
