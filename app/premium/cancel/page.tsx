import Link from "next/link";
export default function LegacyPremiumCancelPage() {
  return <main className="platform-page"><section className="platform-hero"><span className="platform-kicker">Plată anulată</span><h1 className="platform-title">Nu s-a efectuat nicio plată</h1><p className="platform-subtitle">Poți reveni la planuri și relua plata când dorești.</p><Link className="platform-button" href="/pricing">Înapoi la planuri</Link></section></main>;
}
