"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import WorkspaceTabs from "@/components/WorkspaceTabs";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/use-current-user";
import { useUI } from "@/lib/ui-context";

type SavedCalculation = {
  id: string;
  profileId?: string;
  monthKey?: string;
  unlockSource?: string;
  updatedAt?: string;
  calculationVersion?: string;
  snapshot?: {
    result?: { netCash?: number; netWithBenefits?: number; employerTotalCost?: number; grossTaxable?: number; warnings?: string[] };
    mode?: string;
    entries?: unknown[];
  };
};

function money(value?: number) { return typeof value === "number" ? `${value.toFixed(2)} lei` : "—"; }

export default function HistoryPage() {
  const { language } = useUI();
  const ro = language === "ro";
  const { user, loading } = useCurrentUser();
  const [items, setItems] = useState<SavedCalculation[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "monthlyCalculations"), orderBy("updatedAt", "desc"));
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedCalculation))), () => setItems([]));
  }, [user]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.snapshot?.result?.netWithBenefits || 0), 0), [items]);

  if (loading) return <main className="platform-page">...</main>;
  if (!user) return <main className="platform-page"><section className="platform-hero"><h1 className="platform-title">{ro ? "Intră în cont pentru istoric." : "Sign in to view history."}</h1><Link className="platform-button" href="/login?next=/history">{ro ? "Autentificare" : "Sign in"}</Link></section></main>;

  return <main className="platform-page">
    <WorkspaceTabs />
    <section className="platform-hero"><span className="platform-kicker">{ro ? "Istoric lunar" : "Monthly history"}</span><h1 className="platform-title">{ro ? "Fiecare lună păstrează exact regulile folosite." : "Every month keeps the exact rules used."}</h1><p className="platform-subtitle">{ro ? "Schimbarea salariului sau taxelor curente nu modifică lunile deja deblocate. Recalcularea aceleiași luni nu consumă alt credit." : "Changing current salary or taxes does not alter previously unlocked months. Recalculating the same month does not consume another credit."}</p></section>
    <section className="platform-grid">
      <article className="platform-card span-4"><span className="platform-kicker">{ro ? "Luni salvate" : "Saved months"}</span><h2>{items.length}</h2></article>
      <article className="platform-card span-4"><span className="platform-kicker">{ro ? "Total rezultate" : "Results total"}</span><h2>{money(total)}</h2><p>{ro ? "Sumă orientativă a valorilor net + beneficii din istoricul vizibil." : "Indicative sum of net plus benefits across visible history."}</p></article>
      <article className="platform-card span-4"><span className="platform-kicker">{ro ? "Calcul nou" : "New calculation"}</span><h2>{ro ? "Altă lună" : "Another month"}</h2><Link className="platform-button" href="/calculator-universal">{ro ? "Deschide calculatorul" : "Open calculator"}</Link></article>
      <article className="platform-card span-12"><h2>{ro ? "Calcule deblocate" : "Unlocked calculations"}</h2>{items.length === 0 ? <p>{ro ? "Nu ai încă luni deblocate. Deblochează o lună cu 1 credit sau folosește un abonament." : "You do not have unlocked months yet. Unlock a month with 1 credit or use a subscription."}</p> : <div style={{display:"grid",gap:12}}>{items.map(item => <div key={item.id} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:14,alignItems:"center",padding:16,border:"1px solid var(--line-ui)",borderRadius:18,background:"var(--surface-raised)"}}><div><strong style={{fontSize:18}}>{item.monthKey || item.id}</strong><div style={{marginTop:6,color:"var(--text-muted)",fontSize:12}}>{ro ? "Profil" : "Profile"}: {item.profileId || "default"} · {ro ? "sursă" : "source"}: {item.unlockSource || "—"} · {item.calculationVersion || "—"}</div><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:10,fontSize:13}}><span>{ro ? "Net cash" : "Cash net"}: <strong>{money(item.snapshot?.result?.netCash)}</strong></span><span>{ro ? "Net + beneficii" : "Net + benefits"}: <strong>{money(item.snapshot?.result?.netWithBenefits)}</strong></span><span>{ro ? "Cost angajator" : "Employer cost"}: <strong>{money(item.snapshot?.result?.employerTotalCost)}</strong></span></div></div><Link className="platform-button secondary" href="/calculator-universal">{ro ? "Recalculează" : "Recalculate"}</Link></div>)}</div>}</article>
    </section>
  </main>;
}
