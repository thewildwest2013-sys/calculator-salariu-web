"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="platform-page"><section className="platform-hero"><span className="platform-kicker">Eroare</span><h1 className="platform-title">Ceva nu a funcționat corect</h1><p className="platform-subtitle">Datele tale nu au fost șterse. Reîncearcă, iar dacă problema continuă verifică pagina de securitate și contact.</p><button className="platform-button" onClick={() => reset()}>Reîncearcă</button></section></main>;
}
