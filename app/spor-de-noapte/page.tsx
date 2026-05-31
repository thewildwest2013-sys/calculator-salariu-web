import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spor de Noapte 2026 – Calcul și Drepturi (art. 123 Codul Muncii)",
  description:
    "Sporul de noapte în România: minimum 25% din salariul de bază conform art. 123 Codul Muncii. Exemple de calcul cu 4.050 lei și 7.000 lei brut.",
};

function RelatedLinks() {
  const items = [
    { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
    { href: "/calculator-brut-net", label: "Brut / net" },
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
    title: "Cadrul legal – art. 123 Codul Muncii",
    body: [
      "Conform art. 123 din Codul Muncii, salariații care lucrează între orele 22:00 și 06:00 au dreptul la un spor de noapte de minimum 25% din salariul de bază. Angajatorul poate oferi un procent mai mare prin contractul colectiv sau individual de muncă.",
      "Sporul de noapte se calculează la salariul de bază, nu la salariul brut total (care poate include alte sporuri). Dacă programul de noapte depășește 3 ore pe zi, angajatorul poate alege să reducă programul de lucru cu o oră în loc să plătească sporul.",
    ],
  },
  {
    no: "02",
    title: "Exemplu – brut 4.050 lei, 10 ture de noapte",
    body: [
      "Salariu de bază: 4.050 lei. Spor noapte 25%: 4.050 × 25% = 1.012,50 lei lunar (dacă toate orele sunt de noapte). Dacă ai 10 ture de noapte dintr-un total de 22 zile lucrătoare, sporul se aplică proporțional: 1.012,50 × (10/22) ≈ 460 lei.",
      "Acești 460 lei se adaugă la brut și se impozitează la fel ca salariul normal (CAS 25%, CASS 10%, impozit 10%). Netul suplimentar din spor este de aproximativ 460 × 0,65 = ~299 lei.",
    ],
  },
  {
    no: "03",
    title: "Exemplu – brut 7.000 lei, 14 ture de noapte",
    body: [
      "Salariu de bază: 7.000 lei. Spor noapte 25%: 7.000 × 25% = 1.750 lei/lună dacă toate zilele sunt de noapte. Cu 14 ture de noapte din 22 zile: spor ≈ 1.750 × (14/22) ≈ 1.113 lei brut suplimentar.",
      "Netul suplimentar din acest spor: ~724 lei. Împreună cu netul de bază (~4.095 lei), suma totală poate ajunge la ~4.819 lei, fără bonuri de masă.",
    ],
  },
  {
    no: "04",
    title: "Cum configurezi sporul în aplicație",
    body: [
      "În pagina Reguli, setezi procentul de spor de noapte conform contractului tău (default 25%). Aplicația îl aplică automat la turele marcate ca Night în calendarul lunar.",
      "Poți seta procente diferite pentru weekend (ex: 50%), sărbători legale (ex: 100%) sau ore suplimentare. Calculatorul combină toate sporurile active pentru a estima brutul total și netul final.",
    ],
  },
];

const faq = [
  {
    q: "Sporul de noapte este obligatoriu?",
    a: "Da, minimul de 25% este garantat prin lege (art. 123 Codul Muncii). Angajatorul nu poate plăti mai puțin, dar poate negocia un procent mai mare prin contractul colectiv.",
  },
  {
    q: "Se impozitează sporul de noapte?",
    a: "Da, sporul de noapte este impozabil și supus contribuțiilor sociale (CAS și CASS), la fel ca salariul de bază.",
  },
  {
    q: "Ce se întâmplă dacă lucrez mai mult de 3 ore noaptea?",
    a: "Dacă programul de noapte depășește 3 ore zilnic, angajatorul poate alege fie să plătească sporul de minimum 25%, fie să reducă programul de lucru cu o oră fără reducerea salariului.",
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
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Spor de Noapte 2026</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">
            Minimum 25% din salariul de bază, garantat prin art. 123 Codul Muncii. Cum se calculează, cum se configurează în aplicație și exemple complete cu cifre reale.
          </p>
        </header>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 leading-8 text-white/78 md:p-8">
          <p className="mb-5">
            Sporul de noapte este un drept legal garantat tuturor angajaților care prestează muncă între orele 22:00 și 06:00. Indiferent de domeniu sau angajator, minimul legal este 25% din salariul de bază, stabilit prin art. 123 din Codul Muncii.
          </p>
          <p>
            Aplicația îți permite să setezi procentul exact din contractul tău și să marchezi turele de noapte în calendar. Calculul se face automat proporțional cu numărul de ture de noapte din lună.
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
          Informațiile sunt orientative și nu înlocuiesc verificarea contractului tău individual de muncă, a contractului colectiv sau a legislației în vigoare.
        </div>

        <RelatedLinks />
      </article>
    </main>
  );
}
