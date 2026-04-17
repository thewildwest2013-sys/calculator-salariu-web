"use client";

import { auth } from "@/lib/firebase";
import { getWebDeviceFingerprint } from "@/lib/device";
import { getStoredSessionNonce } from "@/lib/security-client";
import { onAuthStateChanged, type User } from "firebase/auth";

function waitForUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getSecureHeaders(): Promise<HeadersInit> {
  let user = auth.currentUser;

  if (!user) {
    user = await waitForUser();
  }

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const token = await user.getIdToken();
  const fp = await getWebDeviceFingerprint();
  const sessionNonce = getStoredSessionNonce();

  console.log("SECURE API DEBUG", {
    hasUser: !!user,
    hasToken: !!token,
    deviceId: fp?.deviceId ?? null,
    sessionNonce,
  });

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-device-id": fp.deviceId,
    "x-session-nonce": sessionNonce || "",
  };
}