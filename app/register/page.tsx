"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await registerWithEmail(email, password);
      router.push("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare la înregistrare";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <section className="auth-card">
        <div className="text-sm uppercase tracking-[0.22em] text-white/45">Cont nou</div>
        <h1 className="mt-2 text-4xl font-bold">Înregistrare</h1>
        <p className="mt-3 text-white/70">Creează un cont nou pentru a salva calculele și statusul premium.</p>

        <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? "Se creează contul..." : "Creează cont"}</button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="secondary-btn">Înapoi la Home</Link>
          <Link href="/login" className="secondary-btn">Am deja cont</Link>
        </div>
      </section>
    </main>
  );
}
