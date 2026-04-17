"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getWebDeviceFingerprint } from "@/lib/device";
import { getStoredSessionNonce } from "@/lib/security-client";

type UserProfile = {
  email: string;
  isPremium: boolean;
  plan?: string;
  createdAt?: unknown;
  premiumSince?: string | null;
  premiumSource?: string | null;
};

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

      const token = await user.getIdToken();
      const fp = await getWebDeviceFingerprint();
      const sessionNonce = getStoredSessionNonce();

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-device-id": fp.deviceId,
          "x-session-nonce": sessionNonce || "",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
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
    return <main className="app-shell p-8">Se încarcă...</main>;
  }

  if (!user) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-6">
        <section className="auth-card">
          <h1 className="text-3xl font-bold">Premium</h1>
          <p className="mt-4 text-white/70">Trebuie să fii autentificat.</p>
          <Link href="/login" className="primary-btn mt-6 inline-block">
            Mergi la Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell p-6 md:p-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)]">
        <h1 className="text-4xl font-bold">Premium</h1>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/" className="secondary-btn">
            Înapoi la Home
          </Link>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-[#071326]/80 p-4">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p className="mt-2">
            <strong>Status curent:</strong> {profile?.isPremium ? "PREMIUM" : "FREE"}
          </p>
          <p className="mt-2">
            <strong>Plan:</strong> {profile?.plan || "free"}
          </p>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-[#071326]/80 p-4">
          <h2 className="text-2xl font-semibold">Ce primești cu Premium</h2>

          <ul className="mt-4 space-y-2 text-white/85">
            <li>• fără reclame</li>
            <li>• acces complet la funcții premium</li>
            <li>• experiență mai curată în aplicație</li>
            <li>• bază pregătită pentru viitoare funcții extra</li>
          </ul>

          {!profile?.isPremium ? (
            <button
              onClick={activatePremium}
              disabled={checkoutLoading}
              className="primary-btn mt-6 w-full disabled:opacity-50"
            >
              {checkoutLoading ? "Se creează sesiunea..." : "Activează Premium"}
            </button>
          ) : (
            <div className="mt-6 rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="font-semibold">Premium activ</p>
              <p className="mt-2 text-sm opacity-80">
                Abonamentul tău este activ și sincronizat.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}