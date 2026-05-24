"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteUser } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Lang = "ro" | "en";

function usePageLang() {
  const [lang, setLang] = useState<Lang>("ro");

  useEffect(() => {
    const readLang = () => {
      const saved =
        localStorage.getItem("calculator-salariu-lang") ||
        localStorage.getItem("lang") ||
        localStorage.getItem("language");

      if (saved === "en" || saved === "ro") {
        setLang(saved);
      }
    };

    readLang();

    window.addEventListener("storage", readLang);
    window.addEventListener("calculator-salariu-lang-change", readLang);

    return () => {
      window.removeEventListener("storage", readLang);
      window.removeEventListener("calculator-salariu-lang-change", readLang);
    };
  }, []);

  return lang;
}

async function deleteCollectionDocuments(path: string) {
  const snapshot = await getDocs(collection(db, path));
  await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
}

async function deleteUserData(uid: string) {
  await Promise.allSettled([
    deleteDoc(doc(db, "users", uid, "profile", "main")),
    deleteCollectionDocuments(`users/${uid}/history`),
    deleteCollectionDocuments(`users/${uid}/sessions`),
    deleteCollectionDocuments(`users/${uid}/devices`),
    deleteCollectionDocuments(`users/${uid}/calculations`),
    deleteCollectionDocuments(`users/${uid}/logs`),
  ]);

  await Promise.allSettled([deleteDoc(doc(db, "users", uid))]);
}

export default function DeleteAccountPage() {
  const lang = usePageLang();
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const user = auth.currentUser;
  const normalizedConfirm = confirmText.trim().toUpperCase();
  const canDelete = normalizedConfirm === "STERGERE" || normalizedConfirm === "DELETE";

  const t = {
    ro: {
      title: "Ștergere cont",
      intro:
        "Poți șterge automat contul Calculator Salariu și datele asociate direct din această pagină, dacă ești autentificat. Emailul de suport este necesar doar dacă ștergerea automată nu funcționează sau dacă nu mai ai acces la cont.",
      dataTitle: "Ce date se șterg",
      dataItems: [
        "profilul contului;",
        "setările salariale salvate;",
        "istoricul de calcul asociat contului;",
        "sesiunile, dispozitivele și datele de sincronizare stocate în Firebase.",
      ],
      subTitle: "Important despre abonamente",
      subText:
        "Dacă ai un abonament activ prin Google Play sau Stripe, anularea abonamentului trebuie făcută și din platforma prin care a fost achiziționat. Ștergerea contului nu garantează anularea automată a plăților recurente gestionate de terți.",
      confirmTitle: "Confirmare ștergere automată",
      notLogged: "Nu ești autentificat. Intră în cont, apoi revino pe această pagină pentru ștergere automată.",
      label: "Scrie STERGERE pentru confirmare",
      placeholder: "STERGERE",
      button: "Șterge contul și datele",
      deleting: "Se șterge...",
      fallbackTitle: "Dacă ștergerea automată nu funcționează",
      fallbackBefore: "Trimite un email la",
      fallbackAfter:
        "cu subiectul „Ștergere cont Calculator Salariu”. Folosește această variantă doar dacă butonul de ștergere nu funcționează sau nu mai ai acces la cont.",
      back: "Înapoi la calculator",
      mustLogin: "Trebuie să fii autentificat ca să poți șterge contul.",
      mustConfirm: "Scrie STERGERE în câmpul de confirmare.",
      success: "Contul și datele asociate au fost șterse.",
      recentLogin:
        "Din motive de securitate, deloghează-te, autentifică-te din nou și revino pe această pagină pentru ștergere.",
      error:
        "Ștergerea automată nu a reușit. Trimite email la helpcalculatorsalariu@gmail.com dacă problema persistă.",
    },
    en: {
      title: "Delete account",
      intro:
        "You can automatically delete your Salary Calculator account and associated data directly from this page if you are signed in. The support email is needed only if automatic deletion does not work or you no longer have access to your account.",
      dataTitle: "What data is deleted",
      dataItems: [
        "account profile;",
        "saved salary settings;",
        "calculation history associated with the account;",
        "sessions, devices and synchronization data stored in Firebase.",
      ],
      subTitle: "Important subscription note",
      subText:
        "If you have an active subscription through Google Play or Stripe, the subscription must also be cancelled in the platform where it was purchased. Account deletion does not guarantee automatic cancellation of recurring payments managed by third parties.",
      confirmTitle: "Automatic deletion confirmation",
      notLogged: "You are not signed in. Sign in, then return to this page for automatic deletion.",
      label: "Type DELETE to confirm",
      placeholder: "DELETE",
      button: "Delete account and data",
      deleting: "Deleting...",
      fallbackTitle: "If automatic deletion does not work",
      fallbackBefore: "Send an email to",
      fallbackAfter:
        "with the subject “Delete Salary Calculator account”. Use this option only if the deletion button does not work or you no longer have access to the account.",
      back: "Back to calculator",
      mustLogin: "You must be signed in to delete your account.",
      mustConfirm: "Type DELETE in the confirmation field.",
      success: "The account and associated data have been deleted.",
      recentLogin:
        "For security reasons, sign out, sign in again and return to this page for deletion.",
      error:
        "Automatic deletion failed. Send an email to helpcalculatorsalariu@gmail.com if the issue persists.",
    },
  }[lang];

  async function handleDeleteAccount() {
    setStatus("");

    if (!user) {
      setStatus(t.mustLogin);
      return;
    }

    if (!canDelete) {
      setStatus(t.mustConfirm);
      return;
    }

    setBusy(true);

    try {
      await deleteUserData(user.uid);
      await deleteUser(user);

      setStatus(t.success);
      setConfirmText("");
    } catch (error: any) {
      console.error(error);

      if (error?.code === "auth/requires-recent-login") {
        setStatus(t.recentLogin);
      } else {
        setStatus(t.error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-100">
      <h1 className="mb-6 text-4xl font-bold">{t.title}</h1>

      <div className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-6 leading-8 text-slate-200">
        <p>{t.intro}</p>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.dataTitle}</h2>
          <ul className="list-disc pl-6">
            {t.dataItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.subTitle}</h2>
          <p>{t.subText}</p>
        </section>

        <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <h2 className="mb-2 text-2xl font-semibold">{t.confirmTitle}</h2>

          {!user && <p className="mb-4 text-amber-200">{t.notLogged}</p>}

          <label className="mb-2 block text-sm font-semibold text-slate-300">
            {t.label}
          </label>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={t.placeholder}
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-red-400"
          />

          <button
            onClick={handleDeleteAccount}
            disabled={busy || !canDelete || !user}
            className="rounded-xl bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t.deleting : t.button}
          </button>

          {status && (
            <p className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
              {status}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold">{t.fallbackTitle}</h2>
          <p>
            {t.fallbackBefore}{" "}
            <a className="text-blue-300 underline" href="mailto:helpcalculatorsalariu@gmail.com">
              helpcalculatorsalariu@gmail.com
            </a>{" "}
            {t.fallbackAfter}
          </p>
        </section>
      </div>

      <div className="mt-8">
        <Link className="text-blue-300 underline" href="/">
          {t.back}
        </Link>
      </div>
    </main>
  );
}
