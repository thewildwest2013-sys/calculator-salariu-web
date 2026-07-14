"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LegacySuccessContent() {
  const searchParams = useSearchParams();
  const confirmed = Boolean(searchParams.get("session_id"));
  return <main className="platform-page"><section className="platform-hero"><span className="platform-kicker">Plată procesată</span><h1 className="platform-title">Planul se actualizează în cont</h1><p className="platform-subtitle">{confirmed ? "Stripe a confirmat întoarcerea din sesiunea de plată. Drepturile finale sunt acordate numai de webhook-ul securizat." : "Verifică planul în panoul contului. Confirmarea finală este făcută de webhook-ul Stripe."}</p><div className="home-actions"><Link className="platform-button" href="/dashboard">Deschide panoul</Link><Link className="platform-button secondary" href="/pricing">Vezi planurile</Link></div></section></main>;
}

export default function LegacyPremiumSuccessPage() {
  return <Suspense fallback={<main className="platform-page"><section className="platform-card">Se verifică plata…</section></main>}><LegacySuccessContent /></Suspense>;
}
