"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearStoredSecurityState, getSecurityStatus, getStoredSessionNonce, registerBrowserSession } from "@/lib/security-client";

export default function SessionGuard() {
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
      if (!getStoredSessionNonce()) await registerBrowserSession();
      else {
        const status = await getSecurityStatus();
        if (!status.valid) throw new Error("SESSION_INVALID");
      }
    } catch (error) {
      console.warn("SECURITY_SESSION_REJECTED", error instanceof Error ? error.message : error);
      clearStoredSecurityState();
      await signOut(auth).catch(() => undefined);
      if (!location.pathname.startsWith("/login")) location.assign("/login?security=session-invalid");
    }
  }), []);
  return null;
}
