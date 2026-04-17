"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  forceLogoutOtherSessions,
  getSecurityStatus,
  requestImmediateDeviceChange,
} from "@/lib/security-client";

function formatDateTime(value: number | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SecurityPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getSecurityStatus>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshStatus() {
    try {
      setError(null);
      const current = await getSecurityStatus();
      setStatus(current);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nu am putut încărca statusul de securitate.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }
      await refreshStatus();
    });

    return () => unsubscribe();
  }, []);

  const canUnlockNow = useMemo(() => {
    if (!status?.deviceChangeAvailableAt) return true;
    return Date.now() >= status.deviceChangeAvailableAt;
  }, [status]);

  async function handleForceLogout() {
    try {
      setBusy(true);
      setMessage(null);
      setError(null);
      await forceLogoutOtherSessions();
      await refreshStatus();
      setMessage("Toate celelalte sesiuni web au fost invalidate. Browserul curent a rămas activ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut închide celelalte sesiuni.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlockDeviceChange() {
    try {
      setBusy(true);
      setMessage(null);
      setError(null);
      await requestImmediateDeviceChange();
      await refreshStatus();
      setMessage("Ai deblocat imediat schimbarea browserului. Te poți autentifica acum pe un alt dispozitiv web.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut activa schimbarea browserului.");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <section className="auth-card max-w-xl">
          <div className="text-sm uppercase tracking-[0.22em] text-white/45">Security</div>
          <h1 className="mt-2 text-4xl font-bold">Control acces web</h1>
          <p className="mt-3 text-white/70">Trebuie să fii autentificat ca să vezi securitatea sesiunii.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="primary-btn">Mergi la login</Link>
            <Link href="/" className="secondary-btn">Înapoi la Home</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <section className="auth-card max-w-3xl">
        <div className="text-sm uppercase tracking-[0.22em] text-white/45">Security</div>
        <h1 className="mt-2 text-4xl font-bold">Control acces web</h1>
        <p className="mt-3 text-white/70">
          Contul tău poate avea un singur browser/dispozitiv web activ. De aici poți invalida alte sesiuni și poți permite schimbarea browserului.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Dispozitiv activ</div>
            <div className="mt-3 text-lg font-semibold text-white">{status?.activeDeviceLabel || "—"}</div>
            <div className="mt-2 text-sm text-white/65">ID activ: {status?.activeDeviceId || "—"}</div>
            <div className="mt-2 text-sm text-white/65">Sesiune validă aici: {status?.valid ? "Da" : "Nu"}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Schimbare browser</div>
            <div className="mt-3 text-lg font-semibold text-white">
              {canUnlockNow ? "Disponibil acum" : "Blocat până la"}
            </div>
            <div className="mt-2 text-sm text-white/65">
              {canUnlockNow ? "Poți muta contul imediat." : formatDateTime(status?.deviceChangeAvailableAt ?? null)}
            </div>
            <div className="mt-2 text-sm text-white/65">
              Poți și debloca manual mutarea din browserul curent.
            </div>
          </div>
        </div>

        {error && <div className="mt-6 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}
        {message && <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</div>}

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="primary-btn" onClick={handleForceLogout} disabled={busy || loading}>
            {busy ? "Se procesează..." : "Force logout alte browsere"}
          </button>
          <button className="secondary-btn" onClick={handleUnlockDeviceChange} disabled={busy || loading}>
            {busy ? "Se procesează..." : "Schimbă dispozitivul acum"}
          </button>
          <button className="secondary-btn" onClick={() => refreshStatus()} disabled={busy}>
            Reîncarcă statusul
          </button>
          <Link href="/" className="secondary-btn">Înapoi la Home</Link>
        </div>
      </section>
    </main>
  );
}
