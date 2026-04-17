"use client";

import { auth } from "@/lib/firebase";
import { getWebDeviceFingerprint } from "@/lib/device";
import { getStoredSessionNonce } from "@/lib/security-client";

export async function getSecureHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Nu există utilizator autentificat.");
  }

  const token = await user.getIdToken(true);
  const fp = await getWebDeviceFingerprint();
  const sessionNonce = getStoredSessionNonce();

  if (!sessionNonce) {
    throw new Error("Nu există sesiune web validă.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-device-id": fp.deviceId,
    "x-session-nonce": sessionNonce,
  };
}