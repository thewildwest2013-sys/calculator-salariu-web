"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
import {
  clearStoredSecurityState,
  getSecurityStatus,
} from "@/lib/security-client";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/premium/success"]);

export default function SessionGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const alertShownRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function invalidateWithMessage(message: string) {
      if (!isMounted) return;
      clearStoredSecurityState();
      try {
        await logoutUser();
      } catch {
        // ignore
      }
      if (!alertShownRef.current) {
        alertShownRef.current = true;
        window.alert(message);
      }
      router.push("/login");
    }

    async function runValidation() {
      if (PUBLIC_PATHS.has(pathname)) return;
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const status = await getSecurityStatus();
        if (!status.valid) {
          await invalidateWithMessage("Sesiunea ta web a fost invalidată sau contul a fost mutat pe alt browser/dispozitiv.");
        }
      } catch (error) {
        console.error("Session validation failed", error);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      alertShownRef.current = false;
      if (!user) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        return;
      }

      await runValidation();

      if (!timer) {
        timer = setInterval(runValidation, 60_000);
      }
    });

    runValidation();

    return () => {
      isMounted = false;
      unsubscribe();
      if (timer) clearInterval(timer);
    };
  }, [pathname, router]);

  return null;
}
