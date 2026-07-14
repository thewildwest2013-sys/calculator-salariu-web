"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import AuthSimpleShell from "@/components/AuthSimpleShell";
import { useUI } from "@/lib/ui-context";
import { auth } from "@/lib/firebase";
import { ensureUserAccountDocument, mapAuthError, registerWithEmail } from "@/lib/auth";
import styles from "@/components/authSimple.module.css";

export default function RegisterPage() {
  const { language } = useUI();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const ro = language === "ro";

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSuccess("");
    if (password.length < 8) return setError(ro ? "Parola trebuie să aibă minimum 8 caractere." : "Password must contain at least 8 characters.");
    if (password !== confirm) return setError(ro ? "Parolele nu coincid." : "Passwords do not match.");
    try { setLoading(true); await registerWithEmail(email.trim(), password); setSuccess(ro ? "Cont creat. Verifică emailul și confirmă adresa înainte de autentificare." : "Account created. Check your email and verify the address before signing in."); }
    catch (e) { setError(mapAuthError(e)); }
    finally { setLoading(false); }
  }

  async function google() {
    try { setLoading(true); const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" }); const credential = await signInWithPopup(auth, provider); await ensureUserAccountDocument(credential.user); router.replace("/dashboard"); }
    catch (e) { setError(mapAuthError(e)); }
    finally { setLoading(false); }
  }

  return <AuthSimpleShell title={ro ? "Creează cont" : "Create account"} subtitle={ro ? "Primul calcul lunar complet este gratuit. Nu este necesar cardul pentru înregistrare." : "Your first complete monthly calculation is free. No card is required to register."}>
    {error && <div className={styles.error}>{error}</div>}{success && <div className={styles.success}>{success}</div>}
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}><label>Email</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" /></div>
      <div className={styles.field}><label>{ro ? "Parolă" : "Password"}</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="new-password" /></div>
      <div className={styles.field}><label>{ro ? "Confirmă parola" : "Confirm password"}</label><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required autoComplete="new-password" /></div>
      <button className={styles.submit} disabled={loading}>{loading ? (ro ? "Se procesează..." : "Processing...") : (ro ? "Creează contul" : "Create account")}</button>
      <button type="button" className={styles.google} onClick={google} disabled={loading}>G&nbsp;&nbsp;{ro ? "Continuă cu Google" : "Continue with Google"}</button>
    </form>
    <div className={styles.notice}>{ro ? "Prin creare confirmi că ai citit Termenii și Politica de confidențialitate. Datele sensibile nu sunt necesare pentru un cont personal simplu." : "By creating an account you confirm that you have read the Terms and Privacy Policy. Sensitive data is not required for a basic personal account."}</div>
    <div className={styles.switch}>{ro ? "Ai deja cont?" : "Already have an account?"} <Link href="/login">{ro ? "Intră în cont" : "Sign in"}</Link></div>
  </AuthSimpleShell>;
}
