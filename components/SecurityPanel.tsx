"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getSecureHeaders } from "@/lib/secure-api";
import { getSavedLang, type Lang } from "@/lib/i18n";

type SecurityStatus = {
  activeDeviceId?: string;
  changeAvailableAt?: number;
  sessionValid?: boolean;
};

const copy = {
  ro: {
    label: "SECURITY",
    title: "Control acces web",
    text: "Contul tău poate avea un singur browser/dispozitiv web activ. De aici poți verifica statusul, poți invalida alte sesiuni și poți permite schimbarea browserului.",
    active: "DISPOZITIV ACTIV",
    change: "SCHIMBARE BROWSER",
    available: "Disponibil acum",
    valid: "Sesiune validă aici",
    reload: "Reîncarcă statusul",
    logout: "Force logout alte browsere",
    move: "Schimbă dispozitivul acum",
    login: "Autentifică-te pentru a vedea statusul de securitate.",
    loading: "Se încarcă...",
    error: "Nu am putut citi statusul. Încearcă din nou.",
    done: "Gata.",
  },
  en: {
    label: "SECURITY",
    title: "Web access control",
    text: "Your account can have only one active web browser/device. From here you can check the status, invalidate other sessions and allow browser changes.",
    active: "ACTIVE DEVICE",
    change: "BROWSER CHANGE",
    available: "Available now",
    valid: "Session valid here",
    reload: "Reload status",
    logout: "Force logout other browsers",
    move: "Change device now",
    login: "Sign in to view the security status.",
    loading: "Loading...",
    error: "Could not read the status. Try again.",
    done: "Done.",
  },
} as const;

export default function SecurityPanel() {
  const [lang, setLang] = useState<Lang>("ro");
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const read = () => setLang(getSavedLang());
    read();
    window.addEventListener("calculator-salariu-lang-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("calculator-salariu-lang-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const t = copy[lang];

  async function loadStatus() {
    const user = auth.currentUser;
    if (!user) {
      setMessage(t.login);
      return;
    }

    setLoading(true);
    setMessage(t.loading);
    try {
      const response = await fetch("/api/security/status", { headers: await getSecureHeaders() });
      if (!response.ok) throw new Error("status failed");
      const data = await response.json();
      setStatus(data);
      setMessage("");
    } catch (_error) {
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function postAction(url: string) {
    const user = auth.currentUser;
    if (!user) {
      setMessage(t.login);
      return;
    }

    setLoading(true);
    setMessage(t.loading);
    try {
      const response = await fetch(url, { method: "POST", headers: await getSecureHeaders() });
      if (!response.ok) throw new Error("action failed");
      setMessage(t.done);
      await loadStatus();
    } catch (_error) {
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadStatus, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#061122_0%,#07192f_45%,#04101f_100%)] px-4 py-10 text-white">
      <section className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-[#071326]/82 p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/65">{t.label}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">{t.text}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/55">{t.active}</div>
            <div className="mt-3 break-all text-sm text-white/70">{status?.activeDeviceId || "—"}</div>
            <div className="mt-3 text-sm font-bold text-emerald-200">{status?.sessionValid ? t.valid : "—"}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/55">{t.change}</div>
            <div className="mt-3 text-sm text-white/70">{status?.changeAvailableAt ? new Date(status.changeAvailableAt).toLocaleString() : t.available}</div>
          </div>
        </div>

        {message && <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white/78">{message}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={loading} onClick={loadStatus} className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white/85 transition hover:bg-white/[0.10] disabled:opacity-60">{t.reload}</button>
          <button disabled={loading} onClick={() => postAction("/api/security/force-logout")} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-60">{t.logout}</button>
          <button disabled={loading} onClick={() => postAction("/api/security/request-device-change")} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-5 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/15 disabled:opacity-60">{t.move}</button>
        </div>
      </section>
    </main>
  );
}
