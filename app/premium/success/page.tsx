"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PremiumSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/premium?success=1${sessionId ? `&session_id=${sessionId}` : ""}`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, sessionId]);

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <section className="auth-card text-center">
        <h1 className="text-3xl font-bold">Plată reușită</h1>
        <p className="mt-4 text-white/75">Confirmăm activarea Premium și te redirecționăm...</p>
      </section>
    </main>
  );
}
