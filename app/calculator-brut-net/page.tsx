import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculator Brut Net 2026 – Formula CAS, CASS și Impozit Explicată",
  description:
    "Cum se calculează salariul net din brut în 2026: CAS 25%, CASS 10%, impozit 10%. Exemple complete pentru 4.050 lei, 7.000 lei și 13.000 lei brut.",
};

function RelatedLinks() {
  const items = [
    { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
    { href: "/spor-de-noapte", label: "Spor de noapte" },
    { href: "/bonuri-de-masa", label: "Bonuri de masă" },
    { href: "/concediu-medical", label: "Concediu medical" },
    { href: "/sarbatori-legale-2026", label: "Sărbători legale 2026" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
      <h2 className="text-xl font-black text-white">Articole utile</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-white/10 bg-[#071326]/80 px-4 py-3 text-sm font-bold text-white/82 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

const sections = [
  {
    no: "01",
    title: "Formula de calcul brut → net",
    body: [
      "Pasul 1: CAS (pensie) = brut × 25%. Pasul 2: CASS (sănătate) = brut × 10%. Pasul 3: Baza impozabilă = brut − CAS − CASS. Pasul 4: Impozit pe venit = baza impozabilă × 10%. Pasul 5: Net = brut − CAS − CASS − Impozit.",
      "Bonurile de masă nu sunt supuse impozitului și contribuțiilor sociale, deci se adaugă separat la suma netă. Sporurile (noapte, weekend, sărbători) se adaugă de regulă la brut înainte de calcul.",
    ],
  },
  {
    no: "02",
    title: "Exemplu complet – salariu minim 4.050 lei brut",
    body: [
      "CAS: 4.050 × 25% = 1.012,50 lei. CASS: 4.050 × 10% = 405 lei. Baza impozabilă: 4.050 − 1.012,50 − 405 = 2.632,50 lei. Impozit: 2.632,50 × 10% = 263,25 lei.",
      "Net final: 4.050 − 1.012,50 − 405 − 263,25 = 2.369,25 lei. Cu 20 bonuri de masă × 40 lei = 800 lei neimpozabile, totalul primit devine aproximativ 3.169 lei.",
    ],
  },
  {
    no: "03",
    title: "Exemplu – brut 7.000 lei",
    body: [
      "CAS: 1.750 lei. CASS: 700 lei. Baza impozabilă: 4.550 lei. Impozit: 455 lei. Net: 4.095 lei.",
      "Cu 22 bonuri × 40 lei (880 lei) și un spor de noapte de ~300 lei, suma totală primită poate ajunge la aproximativ 5.275 lei.",
    ],
  },
  {
    no: "04",
    title: "Exemplu – brut 13.000 lei",
    body: [
      "CAS: 3.250 lei. CASS: 1.300 lei. Baza impozabilă: 8.450 lei. Impozit: 845 lei. Net: 7.605 lei.",
      "Angajații din IT cu scutire de impozit pe venit economisesc 845 lei lunar (în acest exemplu), ceea ce înseamnă o diferență anuală de ~10.140 lei față de un angajat fără scutire.",
    ],
  },
];

const faq = [
  {
    q: "Ce înseamnă CAS și CASS?",
    a: "CAS este contribuția la pensie (25% din brut), plătită de angajat. CASS este contribuția la sănătate (10% din brut), tot plătită de angajat. Angajatorul plătește separat contribuția la asigurări de muncă.",
  },
  {
    q: "Scutirea de impozit IT funcționează automat?",
    a: "Nu. Trebuie să o ceri angajatorului, care verifică eligibilitatea și o aplică în statul de plată. În calculator o poți simula setând impozitul la 0% în pagina Reguli.",
  },
  {
    q: "De ce netul meu diferă față de calcul?",
    a: "Pot exista deduceri personale (pentru persoane în întreținere), prime, penalizări, ore lipsă sau corecții din lunile anterioare pe care calculatorul nu le știe. Fluturașul de salariu rămâne documentul oficial.",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#061122_0%,#07192f_45%,#04101f_100%)] px-4 py-10 text-white">
      <article className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/65">Ghid salarizare România</p>
          <Link href="/" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]">
            Înapoi la calculator
          </Link>
        </div>

        <header className="rounded-[32px] border border-white/10 bg-[#071326]/82 p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] md:p-8">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Calculator Brut → Net 2026</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">
            Formula completă pentru a calcula salariul net din brut în 2026: CAS 25%, CASS 10%, impozit 10%, cu exemple numerice reale pentru 4.050 lei, 7.000 lei și 13.000 lei brut.
          </p>
        </header>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 leading-8 text-white/78 md:p-8">
          <p className="mb-5">
            Calculul salariului net din brut urmează o formulă fixă stabilită prin lege. Contribuțiile se calculează procentual din brut, iar impozitul se aplică pe baza impozabilă rămasă după deducerea CAS și CASS.
          </p>
          <p>
            Dacă brutul introdus în aplicație corespunde cu salariul din contractul tău, estimarea va fi apropiată de suma reală. Diferențele pot apărea din prime, deduceri personale, scutiri de impozit sau corecții aplicate de angajator.
          </p>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 leading-7 text-white/75">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/55">{section.no}</div>
              <h2 className="text-2xl font-black text-white">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
          <h2 className="text-2xl font-black">Întrebări frecvente</h2>
          <div className="mt-5 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-[18px] border border-white/10 bg-[#071326]/75 p-4">
                <summary className="cursor-pointer font-black text-white">{item.q}</summary>
                <p className="mt-3 leading-7 text-white/72">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-[24px] border border-amber-300/15 bg-amber-300/[0.055] p-5 leading-7 text-amber-50/78">
          Informațiile sunt orientative și nu înlocuiesc calculul oficial al angajatorului, consultanța contabilă sau verificarea legislației aplicabile.
        </div>

        <RelatedLinks />
      </article>
    </main>
  );
}
