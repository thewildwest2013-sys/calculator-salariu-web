"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PremiumSuccessContent() {
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState("Se verifică plata...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      setStatusText("Plata a fost confirmată. Premium ar trebui să fie activat în cont.");
    } else {
      setStatusText("Plata a fost finalizată. Poți reveni în aplicație și verifica planul.");
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.20),_transparent_18%),linear-gradient(180deg,#071427_0%,#07192f_40%,#051324_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
        <div className="inline-flex rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200">
          ✅ Premium
        </div>

        <h1 className="mt-4 text-3xl font-bold md:text-5xl">
          Plata a fost procesată
        </h1>

        <p className="mt-4 text-lg leading-8 text-white/80">
          {statusText}
        </p>

        <div className="mt-6 rounded-[20px] border border-white/10 bg-[#071326]/80 p-4 text-sm text-white/70">
          Dacă planul nu se actualizează imediat, dă refresh, deloghează-te și loghează-te din nou sau revino în câteva secunde.
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-[18px] bg-blue-600 px-6 py-3 text-center text-base font-semibold transition hover:bg-blue-500"
          >
            Înapoi în aplicație
          </Link>

          <Link
            href="/premium"
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-center text-base font-semibold transition hover:bg-white/[0.08]"
          >
            Vezi Premium
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.20),_transparent_18%),linear-gradient(180deg,#071427_0%,#07192f_40%,#051324_100%)] px-4 py-10 text-white">
          <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
            <h1 className="text-3xl font-bold md:text-5xl">Se încarcă...</h1>
          </div>
        </main>
      }
    >
      <PremiumSuccessContent />
    </Suspense>
  );
}
