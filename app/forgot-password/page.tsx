"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthSimpleShell from "@/components/AuthSimpleShell";
import { useUI } from "@/lib/ui-context";
import { mapAuthError, sendResetPasswordEmail } from "@/lib/auth";
import styles from "@/components/authSimple.module.css";

export default function ForgotPasswordPage() {
  const { language } = useUI(); const ro = language === "ro";
  const [email,setEmail]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [success,setSuccess]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setError("");setSuccess("");try{setLoading(true);await sendResetPasswordEmail(email.trim());setSuccess(ro?"Dacă adresa există, linkul de resetare a fost trimis. Verifică și Spam/Junk.":"If the address exists, a reset link has been sent. Check Spam/Junk as well.");}catch(err){setError(mapAuthError(err));}finally{setLoading(false)}}
  return <AuthSimpleShell title={ro?"Resetează parola":"Reset password"} subtitle={ro?"Introdu adresa contului. Vei primi un link securizat pentru alegerea unei parole noi.":"Enter your account address. You will receive a secure link to choose a new password."}>
    {error&&<div className={styles.error}>{error}</div>}{success&&<div className={styles.success}>{success}</div>}
    <form className={styles.form} onSubmit={submit}><div className={styles.field}><label>Email</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" /></div><button className={styles.submit} disabled={loading}>{loading?(ro?"Se trimite...":"Sending..."):(ro?"Trimite linkul":"Send reset link")}</button></form>
    <div className={styles.switch}><Link href="/login">← {ro?"Înapoi la autentificare":"Back to sign in"}</Link></div>
  </AuthSimpleShell>;
}
