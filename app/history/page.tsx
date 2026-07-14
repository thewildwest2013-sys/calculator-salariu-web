"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import WorkspaceTabs from "@/components/WorkspaceTabs";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/use-current-user";
import { useUI } from "@/lib/ui-context";

type SavedCalculation = {
  id: string;
  profileId?: string;
  monthKey?: string;
  source?: string;
  unlockSource?: string;
  createdAt?: string;
  updatedAt?: string;
  calculationVersion?: string;
  legacy?: boolean;
  snapshot?: {
    result?: {
      netCash?: number;
      netWithBenefits?: number;
      employerTotalCost?: number;
      grossTaxable?: number;
      warnings?: string[];
    };
    mode?: string;
    entries?: unknown[];
  };
};

function money(value?: number) {
  return typeof value === "number" ? `${value.toFixed(2)} lei` : "—";
}

export default function HistoryPage() {
  const { language } = useUI();
  const ro = language === "ro";
  const { user, loading } = useCurrentUser();
  const [current, setCurrent] = useState<SavedCalculation[]>([]);
  const [legacy, setLegacy] = useState<SavedCalculation[]>([]);

  useEffect(() => {
    if (!user) return;

    const stopCurrent = onSnapshot(
      collection(db, "users", user.uid, "calculations"),
      snap => setCurrent(snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedCalculation))),
      () => setCurrent([]),
    );
    const stopLegacy = onSnapshot(
      collection(db, "users", user.uid, "monthlyCalculations"),
      snap => setLegacy(snap.docs.map(d => ({ id: d.id, legacy: true, ...d.data() } as SavedCalculation))),
      () => setLegacy([]),
    );

    return () => {
      stopCurrent();
      stopLegacy();
    };
  }, [user]);

  const items = useMemo(
    () => [...current, ...legacy].sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""))),
    [current, legacy],
  );
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.snapshot?.result?.netWithBenefits || 0), 0), [items]);

  if (loading) return <main className="platform-page">...</main>;
  if (!user) return <main className="platform-page"><section className="platform-hero"><h1 className="platform-title">{ro ? "Intră în cont pentru istoric." : "Sign in to view history."}</h1><Link className="platform-button" href="/login?next=/history">{ro ? "Autentificare" : "Sign in"}</Link></section></main>;

  return <main className="platform-page">
    <WorkspaceTabs />
    <section className="platform-hero">
      <span className="platform-kicker">{ro ? "Istoric calcule" : "Calculation history"}</span>
      <h1 className="platform-title">{ro ? "Fiecare rulare plătită păstrează exact datele și regulile folosite." : "Every paid run keeps the exact inputs and rules used."}</h1>
      <p className="platform-subtitle">{ro ? "Un rezultat salvat poate fi redeschis fără alt credit. Modificarea datelor și efectuarea unui calcul nou consumă un credit nou, în lipsa unui abonament activ." : "A saved result can be reopened without another credit. Changing inputs and running a new calculation uses another credit unless an active subscription is present."}</p>
    </section>
    <section className="platform-grid">
      <article className="platform-card span-4"><span className="platform-kicker">{ro ? "Rezultate salvate" : "Saved results"}</span><h2>{items.length}</h2></article>
      <article className="platform-card span-4"><span className="platform-kicker">{ro ? "Total rezultate" : "Results total"}</span><h2>{money(total)}</h2><p>{ro ? "Sumă orientativă a valorilor net + beneficii din istoricul vizibil." : "Indicative sum of net plus benefits across visible history."}</p></article>
      <article className="platform-card span-4"><span className="platform-kicker">{ro ? "Calcul nou" : "New calculation"}</span><h2>{ro ? "Altă simulare" : "Another simulation"}</h2><Link className="platform-button" href="/calculator-universal">{ro ? "Deschide calculatorul" : "Open calculator"}</Link></article>
      <article className="platform-card span-12">
        <h2>{ro ? "Calcule salvate" : "Saved calculations"}</h2>
        {items.length === 0 ? <p>{ro ? "Nu ai încă rezultate salvate. Un credit efectuează un calcul complet pe profilul principal, iar Premium include calcule nelimitate." : "You do not have saved results yet. One credit runs one complete calculation on the main profile, while Premium includes unlimited calculations."}</p> : <div style={{display:"grid",gap:12}}>
          {items.map(item => <div key={`${item.legacy ? "legacy" : "current"}-${item.id}`} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:14,alignItems:"center",padding:16,border:"1px solid var(--line-ui)",borderRadius:18,background:"var(--surface-raised)"}}>
            <div>
              <strong style={{fontSize:18}}>{item.monthKey || item.id}</strong>
              <div style={{marginTop:6,color:"var(--text-muted)",fontSize:12}}>{ro ? "Profil" : "Profile"}: {item.profileId || "default"} · {ro ? "sursă" : "source"}: {item.source || item.unlockSource || "—"} · {item.calculationVersion || "—"}{item.legacy ? ` · ${ro ? "format vechi" : "legacy format"}` : ""}</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:10,fontSize:13}}><span>{ro ? "Net cash" : "Cash net"}: <strong>{money(item.snapshot?.result?.netCash)}</strong></span><span>{ro ? "Net + beneficii" : "Net + benefits"}: <strong>{money(item.snapshot?.result?.netWithBenefits)}</strong></span><span>{ro ? "Cost angajator" : "Employer cost"}: <strong>{money(item.snapshot?.result?.employerTotalCost)}</strong></span></div>
            </div>
            <Link className="platform-button secondary" href={`/calculator-universal?calculationId=${encodeURIComponent(item.id)}${item.legacy ? "&legacy=1" : ""}`}>{ro ? "Deschide rezultatul" : "Open result"}</Link>
          </div>)}
        </div>}
      </article>
    </section>
  </main>;
}
