"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getSecureHeaders } from "@/lib/secure-api";

type UserProfile = {
  email: string;
  isPremium: boolean;
  plan?: string;
  createdAt?: unknown;
  premiumSince?: string | null;
  premiumSource?: string | null;
};

const benefits = [
  "No ad gate before calculation",
  "15+ calcule lunare și acces prioritar la funcții noi",
  "Cloud saving and personal calculation history",
  "Cleaner experience on phone and desktop",
  "Prepared base for PDF export and monthly reports",
];

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function loadProfile(uid: string) {
    const ref = doc(db, "users", uid, "profile", "main");
    const snap = await getDoc(ref);
    setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
  }

  async function activatePremium() {
    if (!user) {
      alert("Trebuie să fii autentificat.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const headers = await getSecureHeaders();

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers,
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Nu s-a putut crea sesiunea Stripe");
      }
    } catch {
      alert("Eroare la inițierea plății");
    } finally {
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      loadProfile(user.uid);
    }
  }, [user]);

  if (loading) {
    return <main className="app-shell p-8 text-white">Se încarcă...</main>;
  }

  if (!user) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <section className="auth-card max-w-xl">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Premium</div>
          <h1 className="mt-2 text-3xl font-bold">Activate Premium</h1>
          <p className="mt-4 text-white/70">Trebuie să fii autentificat pentru a continua.</p>
          <Link href="/login" className="primary-btn mt-6 inline-block">
            Mergi la Login
          </Link>
        </section>
      </main>
    );
  }

  const isPremium = !!profile?.isPremium;

  return (
    <main className="app-shell p-6 md:p-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-blue-200/60">Salary Calculator Premium</div>
            <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">
              Faster, without interruptions
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Premium is for users who frequently calculate salaries, save monthly data and want a clean experience without unnecessary steps.
            </p>
          </div>

          <Link href="/" className="secondary-btn w-fit">
            Back to Home
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#071326]/85 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-white/55">Monthly plan</div>
                <div className="mt-1 text-4xl font-bold">14,99 lei</div>
                <div className="mt-1 text-sm text-white/50">Cancel anytime</div>
              </div>

              <div className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${isPremium ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-yellow-400/20 bg-yellow-400/10 text-yellow-100"}`}>
                {isPremium ? "Premium active" : "Status: Free"}
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/75">
              <div className="break-all"><strong>Email:</strong> {user.email}</div>
              <div className="mt-2"><strong>Plan curent:</strong> {profile?.plan || "free"}</div>
            </div>

            {!isPremium ? (
              <button
                onClick={activatePremium}
                disabled={checkoutLoading}
                className="primary-btn mt-6 w-full disabled:opacity-50"
              >
                {checkoutLoading ? "Se creează sesiunea..." : "Activate Premium"}
              </button>
            ) : (
              <div className="mt-6 rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-50">
                <p className="font-semibold">Abonamentul tău este activ.</p>
                <p className="mt-2 text-sm opacity-80">Premium este sincronizat cu profilul tău.</p>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#071326]/85 p-5">
            <h2 className="text-2xl font-semibold">What you get</h2>
            <div className="mt-5 space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">✓</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
