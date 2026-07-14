"use client";

import Link from "next/link";
import { useUI } from "@/lib/ui-context";

export type LegalSection = { title: string; paragraphs: string[]; items?: string[] };
export type LegalContent = { kicker: string; title: string; updated: string; intro: string; sections: LegalSection[]; notice?: string };

export default function LegalPage(props: LegalContent & { english?: LegalContent }) {
  const { language } = useUI();
  const content = language === "en" && props.english ? props.english : props;
  return <main className="platform-page">
    <section className="platform-hero"><span className="platform-kicker">{content.kicker}</span><h1 className="platform-title">{content.title}</h1><p className="platform-subtitle">{content.intro}</p><p style={{color:"var(--text-muted)",fontSize:11,marginTop:18}}>{language === "ro" ? "Ultima actualizare" : "Last updated"}: {content.updated}</p></section>
    {content.notice && <div style={{marginTop:18,padding:16,border:"1px solid rgba(245,158,11,.25)",borderRadius:16,color:"#fbbf24",background:"rgba(120,53,15,.10)",lineHeight:1.6,fontSize:12}}>{content.notice}</div>}
    <section className="platform-grid">{content.sections.map((section,index)=><article className={`platform-card ${index===0?"span-12":"span-6"}`} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{section.items&&<ul style={{color:"var(--text-muted)",lineHeight:1.8}}>{section.items.map(item=><li key={item}>{item}</li>)}</ul>}</article>)}</section>
    <div className="platform-tabs"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/security">Security</Link><Link href="/cookies">Cookies</Link><Link href="/retention">Retention</Link><Link href="/ai-policy">AI Policy</Link><Link href="/dpa">DPA</Link><Link href="/subprocessors">Subprocessors</Link></div>
  </main>;
}
