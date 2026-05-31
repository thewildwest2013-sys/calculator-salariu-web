import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sărbători Legale 2026 România – Calendar Complet și Drepturi Salariale",
  description:
    "Lista completă a sărbătorilor legale din România în 2026: 15 zile libere plătite. Drepturi legale, spor de sărbătoare și cum le marchezi în calculatorul de salariu.",
};

const holidays2026 = [
  { date: "1 ianuarie (joi)", name: "Anul Nou" },
  { date: "2 ianuarie (vineri)", name: "A doua zi de Anul Nou" },
  { date: "24 ianuarie (sâmbătă)", name: "Ziua Unirii Principatelor Române" },
  { date: "10 aprilie (vineri)", name: "Vinerea Mare (Paște ortodox)" },
  { date: "12 aprilie (duminică)", name: "Paștele ortodox" },
  { date: "13 aprilie (luni)", name: "A doua zi de Paște" },
  { date: "1 mai (vineri)", name: "Ziua Muncii" },
  { date: "1 iunie (luni)", name: "Ziua Copilului" },
  { date: "8 iunie (duminică)", name: "Rusalii" },
  { date: "9 iunie (luni)", name: "A doua zi de Rusalii" },
  { date: "15 august (sâmbătă)", name: "Adormirea Maicii Domnului" },
  { date: "30 noiembrie (luni)", name: "Sfântul Andrei" },
  { date: "1 decembrie (marți)", name: "Ziua Națională a României" },
  { date: "25 decembrie (vineri)", name: "Crăciunul" },
  { date: "26 decembrie (sâmbătă)", name: "A doua zi de Crăciun" },
];

const sections = [
  {
    no: "01",
    title: "Dreptul la zi liberă plătită",
    body: [
      "Conform art. 139 din Codul Muncii, angajații au dreptul la zi liberă plătită în toate cele 15 sărbători legale. Dacă o sărbătoare cade în weekend, angajatorul acordă de regulă o zi liberă compensatorie în cursul săptămânii, deși legislația nu impune automat recuperarea.",
      "Zilele de sărbătoare nu se scad din concediul de odihnă. Dacă ești în concediu de odihnă și o sărbătoare legală cade în acea perioadă, ziua nu se consumă din concediu.",
    ],
  },
  {
    no: "02",
    title: "Sporul pentru munca în sărbători legale",
    body: [
      "Dacă lucrezi într-o zi de sărbătoare legală, ai dreptul la un spor de minimum 100% din salariul de bază pentru orele lucrate, conform art. 142 din Codul Muncii. Angajatorul poate oferi în schimb zile libere compensatorii în următoarele 30 de zile.",
      "Exemplu: dacă salariul tău de bază este 4.050 lei și lucrezi o zi de sărbătoare (8 ore din ~168 ore/lună), sporul brut este: 4.050 / 168 × 8 × 100% ≈ 193 lei brut suplimentar.",
    ],
  },
  {
    no: "03",
    title: "Cum marchezi sărbătorile în aplicație",
    body: [
      "Aplicația detectează automat sărbătorile legale cunoscute și le marchează în calendarul lunar cu o culoare distinctă. Nu trebuie să le introduci manual pentru lunile în care baza de date este actualizată.",
      "În pagina Reguli poți seta procentul de spor pentru sărbători legale (implicit 100%). Dacă lucrezi în acea zi și o marchezi ca tură lucrată, aplicația adaugă automat sporul la estimare.",
    ],
  },
  {
    no: "04",
    title: "Zile de punte și recuperări",
    body: [
      "Când o sărbătoare legală cade joi sau marți, mulți angajatori acordă ziua de vineri sau luni ca zi liberă suplimentară (\"punte\"). Aceasta nu este impusă prin lege, ci depinde de decizia angajatorului sau de contractul colectiv.",
      "În 2026, potențiale punți: 2 ianuarie (vineri, după Anul Nou – joi), 15 mai (vineri, posibil punte după Înălțarea Domnului dacă se aplică), 31 octombrie (vineri). Verifică cu angajatorul tău.",
    ],
  },
];

const faq = [
  {
    q: "Ce se întâmplă dacă sărbătoarea cade sâmbăta sau duminica?",
    a: "Legea nu obligă angajatorul să acorde automat o zi liberă compensatorie în cursul săptămânii, dar multe contracte colective o prevăd. Verifică contractul tău colectiv de muncă.",
  },
  {
    q: "Concediul de odihnă include zilele de sărbătoare?",
    a: "Nu. Dacă o sărbătoare legală cade în perioada concediului tău de odihnă, ziua respectivă nu se consumă din concediu (art. 144 Codul Muncii).",
  },
  {
    q: "Sporul de sărbătoare se plătește și pentru munca parțială?",
    a: "Da, sporul se calculează proporțional cu orele lucrate în ziua de sărbătoare, nu neapărat pentru o zi întreagă.",
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
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Sărbători Legale 2026 România</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">
            Calendar complet cu cele 15 zile libere legale din 2026, drepturile tale salariale conform Codului Muncii și cum le marchezi în calculatorul de salariu.
          </p>
        </header>

        {/* Holiday list */}
        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#071326]/80 p-6 md:p-8">
          <h2 className="mb-5 text-2xl font-black">Cele 15 sărbători legale în 2026</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {holidays2026.map((h, i) => (
              <div key={i} className="rounded-[16px] border border-cyan-300/10 bg-cyan-300/[0.03] p-3">
                <div className="text-xs font-bold text-cyan-200/60">{h.date}</div>
                <div className="mt-1 font-black text-white">{h.name}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-white/55">
            * Lista se bazează pe Legea nr. 53/2003 (Codul Muncii) și HG privind zilele libere. Verifică eventualele modificări legislative înainte de finalul anului.
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
          Informațiile sunt orientative. Lista sărbătorilor legale trebuie verificată cu surse oficiale (Monitorul Oficial) și cu regulamentul intern al angajatorului.
        </div>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-xl font-black text-white">Articole utile</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/calculator-salariu-2026", label: "Ghid salariu 2026" },
              { href: "/calculator-brut-net", label: "Brut / net" },
              { href: "/spor-de-noapte", label: "Spor de noapte" },
              { href: "/concediu-medical", label: "Concediu medical" },
              { href: "/bonuri-de-masa", label: "Bonuri de masă" },
              { href: "/faq", label: "FAQ" },
            ].map((item) => (
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
      </article>
    </main>
  );
}
