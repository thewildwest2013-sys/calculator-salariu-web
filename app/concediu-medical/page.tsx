import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concediu Medical 2026 – Calcul Indemnizație, Procente și Drepturi",
  description:
    "Cum se calculează indemnizația de concediu medical în 2026: 75%, 80% sau 100% din baza de calcul. Angajatorul plătește primele 5 zile, CNAS din ziua 6.",
};

function RelatedLinks() {
  const items = [
    { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
    { href: "/calculator-brut-net", label: "Brut / net" },
    { href: "/spor-de-noapte", label: "Spor de noapte" },
    { href: "/sarbatori-legale-2026", label: "Sărbători legale 2026" },
    { href: "/bonuri-de-masa", label: "Bonuri de masă" },
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
    title: "Cine plătește concediul medical",
    body: [
      "Angajatorul plătește indemnizația pentru primele 5 zile calendaristice de concediu medical. Începând cu ziua a 6-a, plata este asigurată de Casa Națională de Asigurări de Sănătate (CNAS), din fondul de asigurări sociale de sănătate.",
      "Pentru a beneficia de plată din ziua a 6-a, angajatul trebuie să aibă minimum 6 luni de stagiu de cotizare în ultimele 12 luni. Excepțiile includ urgențele medicale și bolile infectocontagioase, pentru care CNAS plătește de la prima zi.",
    ],
  },
  {
    no: "02",
    title: "Procentele de indemnizație",
    body: [
      "Procentul aplicat depinde de tipul de concediu medical: 75% din baza de calcul pentru boli obișnuite și carantină; 80% pentru boli profesionale, accidente de muncă, tuberculoză, neoplazii și SIDA; 100% pentru urgențe chirurgicale, îngrijirea copilului bolnav sub 7 ani sau handicapat sub 18 ani.",
      "Baza de calcul este media veniturilor brute lunare din ultimele 6 luni anterioare lunii în care survine incapacitatea de muncă, împărțită la numărul de zile lucrătoare din acea perioadă.",
    ],
  },
  {
    no: "03",
    title: "Exemplu de calcul – boli obișnuite (75%)",
    body: [
      "Salariat cu medie brut ultimele 6 luni: 5.000 lei/lună. Zile lucrătoare medii: 21 zile/lună. Baza zilnică: 5.000 / 21 = ~238 lei/zi. Indemnizație zilnică: 238 × 75% = ~178,50 lei/zi.",
      "Pentru 10 zile de concediu medical: primele 5 zile = plătite de angajator (5 × 178,50 = 892,50 lei brut), zilele 6–10 = plătite de CNAS (5 × 178,50 = 892,50 lei brut). Total brut: ~1.785 lei. Din această sumă se rețin CASS 10% și impozit 10%.",
    ],
  },
  {
    no: "04",
    title: "Cum marchezi concediul medical în aplicație",
    body: [
      "În calendarul lunar marchezi zilele de concediu medical cu tipul Medical (M). Aplicația le identifică separat față de zilele de muncă și le exclude din calculul normal de ture și sporuri.",
      "Indemnizația exactă nu poate fi calculată automat fără istoricul veniturilor din ultimele 6 luni. Aplicația afișează o estimare orientativă. Pentru suma exactă, contactează departamentul de resurse umane sau medicul de medicina muncii.",
    ],
  },
];

const faq = [
  {
    q: "Se rețin contribuțiile din indemnizația de boală?",
    a: "Da. Din indemnizația de concediu medical se rețin CASS (10%) și impozit pe venit (10%). CAS (pensie) nu se reține din indemnizația de boală plătită de CNAS.",
  },
  {
    q: "Bonurile de masă se primesc în zilele de concediu medical?",
    a: "Nu. Bonurile de masă se acordă doar pentru zilele efectiv lucrate. Zilele de concediu medical nu dau dreptul la bon de masă.",
  },
  {
    q: "Ce se întâmplă dacă am mai puțin de 6 luni stagiu?",
    a: "Dacă nu îndeplinești stagiul de cotizare, angajatorul plătește primele 5 zile, dar CNAS poate refuza plata din ziua a 6-a. Excepțiile sunt urgențele și bolile infectocontagioase.",
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
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Concediu Medical 2026</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">
            Cum se calculează indemnizația de boală: cine plătește, ce procent se aplică (75%, 80% sau 100%) și un exemplu complet cu cifre reale.
          </p>
        </header>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 leading-8 text-white/78 md:p-8">
          <p className="mb-5">
            Concediul medical este reglementat prin OUG 158/2005 și oferă protecție financiară angajaților care nu pot presta activitate din cauza unei boli sau accidente. Suma primită nu este egală cu salariul normal – procentul variază între 75% și 100% din baza de calcul, în funcție de tipul afecțiunii.
          </p>
          <p>
            Regula cheie: angajatorul suportă primele 5 zile de concediu medical, CNAS suportă restul. Există excepții importante pentru urgențe și boli grave.
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
          Informațiile sunt orientative. Suma exactă a indemnizației se stabilește de angajator și CNAS pe baza veniturilor reale din ultimele 6 luni. Consultați medicul curant și HR pentru detalii specifice situației dvs.
        </div>

        <RelatedLinks />
      </article>
    </main>
  );
}
