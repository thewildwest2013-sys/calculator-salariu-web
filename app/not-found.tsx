import Link from "next/link";

export default function NotFound() {
  return <main className="platform-page"><section className="platform-hero"><span className="platform-kicker">404</span><h1 className="platform-title">Pagina nu a fost găsită</h1><p className="platform-subtitle">Adresa poate fi veche sau pagina a fost mutată.</p><div className="home-actions"><Link className="platform-button" href="/">Înapoi acasă</Link><Link className="platform-button secondary" href="/calculator-universal">Deschide calculatorul</Link></div></section></main>;
}
