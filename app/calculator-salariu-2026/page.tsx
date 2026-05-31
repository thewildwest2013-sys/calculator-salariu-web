import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghid Calculator Salariu 2026 – Ture, Sporuri și Salariu Net",
  description:
    "Ghid complet pentru calculul salariului net în 2026: CAS 25%, CASS 10%, impozit 10%, sporuri de noapte, weekend și bonuri de masă. Exemple numerice reale.",
};

function RelatedLinks() {
  const items = [
    { href: "/calculator-brut-net", label: "Brut / net" },
    { href: "/spor-de-noapte", label: "Sporuri" },
    { href: "/bonuri-de-masa", label: "Bonuri" },
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
    title: "Ce contribuții se rețin din salariu în 2026",
    body: [
      "Din salariul brut se rețin trei contribuții principale: CAS (pensie) 25%, CASS (sănătate) 10% și impozit pe venit 10% din baza impozabilă. Baza impozabilă se calculează după deducerea CAS și CASS din brut.",
      "Exemplu concret pentru brut 5.000 lei: CAS = 1.250 lei, CASS = 500 lei, baza impozabilă = 3.250 lei, impozit = 325 lei. Rezultă un net de aproximativ 2.925 lei, înainte de bonuri sau sporuri.",
    ],
  },
  {
    no: "02",
    title: "Ce introduci în aplicație",
    body: [
      "În pagina Reguli introduci salariul brut, valoarea bonului de masă, procentele pentru sporuri și taxele folosite în estimare. Aceste valori pot fi diferite de la un angajator la altul, de aceea aplicația îți permite să le modifici manual.",
      "Calendarul lunar este locul unde marchezi turele: Morning, After, Night, Vacation sau Medical. Zilele de weekend și sărbătorile legale sunt detectate automat, iar calculatorul le ia în considerare în estimare.",
    ],
  },
  {
    no: "03",
    title: "Cum citești rezultatul",
    body: [
      "Cardul Calcul Live arată rapid netul estimat, bonurile, sporurile și orele lucrate. Pentru un raport mai detaliat folosești tabul Estimare, unde vezi împărțirea pe categorii și impactul setărilor asupra totalului.",
      "Dacă ai concediu medical, ore lipsă sau ore suplimentare, acestea pot modifica suma afișată. Concediul medical se calculează diferit față de zilele normale: angajatorul plătește primele 5 zile, CNAS din ziua 6.",
    ],
  },
  {
    no: "04",
    title: "De ce estimarea poate diferi de fluturașul real",
    body: [
      "Suma reală de pe fluturașul de salariu poate fi influențată de deduceri, prime, concedii, schimbări legislative sau reguli interne ale angajatorului. Din acest motiv, calculatorul este un instrument de verificare rapidă, nu un document oficial.",
      "Compară întotdeauna rezultatul cu fluturașul de salariu, contractul individual de muncă și informațiile primite de la departamentul de resurse umane.",
    ],
  },
];

const examples = [
  {
    title: "Salariu minim brut 2026 – 4.050 lei",
    body: "CAS: 1.012,50 lei | CASS: 405 lei | Impozit: ~263 lei | Net estimat: ~2.369 lei. Dacă adaugi 15 bonuri de masă × 40 lei = 600 lei, totalul net devine ~2.969 lei.",
  },
  {
    title: "Salariu brut 7.000 lei",
    body: "CAS: 1.750 lei | CASS: 700 lei | Impozit: ~455 lei | Net estimat: ~4.095 lei. Cu spor de noapte 25% aplicat la 10 ture, suma poate crește cu 200–350 lei în funcție de orele lucrate.",
  },
];

const faq = [
  {
    q: "Pot folosi calculatorul fără cont?",
    a: "Pentru funcțiile complete, sincronizare și istoric este recomandat contul. Paginile de ghid și informații sunt publice.",
  },
  {
    q: "Rezultatul este identic cu salariul oficial?",
    a: "Nu. Este o estimare orientativă bazată pe valorile introduse de tine. Fluturașul oficial poate include deduceri, prime sau corecții pe care calculatorul nu le cunoaște.",
  },
  {
    q: "Pot modifica procentele CAS, CASS sau impozit?",
    a: "Da, procentele se setează în pagina Reguli, astfel încât să se potrivească situației tale (ex: scutiri de impozit pentru IT, cercetare etc.).",
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
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Ghid Calculator Salariu 2026</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">
            Ghid complet pentru estimarea salariului net: cum se calculează CAS, CASS și impozitul, cum se citesc rezultatele și de ce suma afișată trebuie tratată ca estimare orientativă.
          </p>
        </header>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 leading-8 text-white/78 md:p-8">
          <p className="mb-5">
            Calculatorul de salariu este gândit pentru angajații care lucrează în ture, au bonuri de masă, sporuri sau zile speciale în lună. Pornești de la salariul brut, completezi calendarul cu turele lucrate, iar rezultatul se actualizează automat în funcție de zilele marcate, tura de noapte, weekenduri, sărbători și setările din pagina Reguli.
          </p>
          <p>
            În 2026, contribuțiile standard sunt: CAS 25%, CASS 10% și impozit pe venit 10%. Suma netă finală depinde și de bonurile de masă, sporuri suplimentare și eventualele scutiri de impozit (ex: IT, cercetare, construcții).
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

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 md:p-8">
          <h2 className="text-2xl font-black">Exemple cu cifre reale</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <div key={example.title} className="rounded-[22px] border border-cyan-300/12 bg-cyan-300/[0.035] p-4">
                <h3 className="font-black text-cyan-100">{example.title}</h3>
                <p className="mt-2 leading-7 text-white/72">{example.body}</p>
              </div>
            ))}
          </div>
        </section>

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
