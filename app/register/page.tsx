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

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const finalEmail = email.trim();

    if (!finalEmail) {
      alert("Introdu adresa de email.");
      return;
    }

    if (password.length < 6) {
      alert("Parola trebuie să aibă minimum 6 caractere.");
      return;
    }

    try {
      setLoading(true);

      await registerWithEmail(finalEmail, password);

      alert(
        "Cont creat cu succes.\n\nAm trimis emailul de verificare.\n\nDacă nu îl găsești în Inbox, verifică și folderul Spam/Junk înainte să te autentifici."
      );

      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Eroare la înregistrare";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <section className="auth-card">
        <div className="text-sm uppercase tracking-[0.22em] text-white/45">
          Cont nou
        </div>

        <h1 className="mt-2 text-4xl font-bold">Register</h1>

        <p className="mt-3 text-white/70">
          Creează un cont nou pentru a salva calculele și statusul premium.
        </p>

        <p className="mt-2 text-sm text-white/55">
          După creare, trebuie să confirmi adresa de email. Verifică și folderul
          Spam/Junk dacă emailul nu apare în Inbox.
        </p>

        <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm text-white/75">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="Introdu emailul"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Se creează contul..." : "Creează cont"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="secondary-btn">
            Înapoi la Home
          </Link>

          <Link href="/login" className="secondary-btn">
            Am deja cont
          </Link>
        </div>
      </section>
    </main>
  );
}