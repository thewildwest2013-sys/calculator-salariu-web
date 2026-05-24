import Link from "next/link";

export const metadata = {
  title: "Plată anulată",
  description: "Plata pentru Premium a fost anulată sau nu a fost finalizată.",
};

export default function PremiumCancelPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.20),_transparent_18%),linear-gradient(180deg,#071427_0%,#07192f_40%,#051324_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
        <div className="inline-flex rounded-full bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-100">
          Plată anulată
        </div>

        <h1 className="mt-4 text-3xl font-bold md:text-5xl">
          Abonamentul Premium nu a fost activat
        </h1>

        <p className="mt-4 text-lg leading-8 text-white/80">
          Nu s-a efectuat nicio plată. Poți reveni oricând pe pagina Premium și relua activarea abonamentului.
        </p>

        <div className="mt-6 rounded-[20px] border border-white/10 bg-[#071326]/80 p-4 text-sm text-white/70">
          Dacă ai închis plata din greșeală, apasă din nou pe „Activate Premium”.
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/premium"
            className="rounded-[18px] bg-blue-600 px-6 py-3 text-center text-base font-semibold transition hover:bg-blue-500"
          >
            Înapoi la Premium
          </Link>

          <Link
            href="/"
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-center text-base font-semibold transition hover:bg-white/[0.08]"
          >
            Înapoi în aplicație
          </Link>
        </div>
      </div>
    </main>
  );
}
