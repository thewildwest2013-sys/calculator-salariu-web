"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await loginWithEmail(email, password);
      router.push("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare la autentificare";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <section className="auth-card">
        <div className="text-sm uppercase tracking-[0.22em] text-white/45">Autentificare</div>
        <h1 className="mt-2 text-4xl font-bold">Login</h1>
        <p className="mt-3 text-white/70">Intră în contul tău și continuă de unde ai rămas.</p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? "Se autentifică..." : "Intră în cont"}</button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="secondary-btn">Înapoi la Home</Link>
          <Link href="/register" className="secondary-btn">Creează cont</Link>
        </div>
      </section>
    </main>
  );
}
