"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithEmail,
  logoutUser,
  sendResetPasswordEmail,
} from "@/lib/auth";
import {
  clearStoredSecurityState,
  registerBrowserSession,
} from "@/lib/security-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetBox, setShowResetBox] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      await registerBrowserSession();
      router.push("/");
    } catch (error: unknown) {
      clearStoredSecurityState();

      try {
        await logoutUser();
      } catch {
        // ignore
      }

      const message =
        error instanceof Error ? error.message : "Eroare la autentificare";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const finalEmail = resetEmail.trim();

    if (!finalEmail) {
      alert("Introdu adresa de email pentru resetarea parolei.");
      return;
    }

    try {
      setResetLoading(true);
      await sendResetPasswordEmail(finalEmail);
      alert("Ți-am trimis emailul pentru resetarea parolei.");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Nu am putut trimite emailul de resetare.";
      alert(message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <section className="auth-card">
        <div className="text-sm uppercase tracking-[0.22em] text-white/45">
          Autentificare
        </div>

        <h1 className="mt-2 text-4xl font-bold">Login</h1>

        <p className="mt-3 text-white/70">
          Intră în contul tău pentru a folosi aplicația.
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm text-white/75">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="Introdu emailul"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">Parolă</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Introdu parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Se autentifică..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowResetBox((prev) => !prev)}
          className="mt-5 w-full text-center text-sm text-blue-300 hover:text-blue-200"
        >
          {showResetBox ? "Ascunde resetarea parolei" : "Am uitat parola"}
        </button>

        {showResetBox && (
          <div className="mt-5 rounded-[20px] border border-white/10 bg-[#071326]/80 p-4">
            <p className="mb-4 text-sm text-white/70">
              Introdu emailul contului tău și îți trimitem un link pentru
              resetarea parolei.
            </p>

            <input
              className="auth-input"
              type="email"
              placeholder="Email pentru resetare"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="primary-btn mt-4 w-full disabled:opacity-50"
            >
              {resetLoading
                ? "Se trimite emailul..."
                : "Trimite email de resetare"}
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="secondary-btn">
            Înapoi la Home
          </Link>
          <Link href="/register" className="secondary-btn">
            Creează cont
          </Link>
          <Link href="/security" className="secondary-btn">
            Security
          </Link>
        </div>
      </section>
    </main>
  );
}