import { randomUUID } from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const DEVICE_COOLDOWN_MS = 48 * 60 * 60 * 1000;

export type SecurityDoc = {
  activeDeviceId?: string | null;
  activeDeviceLabel?: string | null;
  sessionNonce?: string | null;
  deviceLockedAt?: number | null;
  deviceChangeAvailableAt?: number | null;
  lastLoginAt?: number | null;
  lastSeenAt?: number | null;
  lastUserAgent?: string | null;
  lastTimezone?: string | null;
  lastLanguage?: string | null;
  lastPlatform?: string | null;
  failedTakeoverCount?: number;
  updatedAt?: number;
};

export async function requireUidFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    throw new Error("Missing auth token");
  }

  const decoded = await adminAuth.verifyIdToken(token, true);
  return decoded.uid;
}

export function securityDocRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("security").doc("main");
}

export function deviceDocRef(uid: string, deviceId: string) {
  return adminDb.collection("users").doc(uid).collection("devices").doc(deviceId);
}

export async function readSecurityDoc(uid: string): Promise<SecurityDoc | null> {
  const snap = await securityDocRef(uid).get();
  return snap.exists ? (snap.data() as SecurityDoc) : null;
}

export function buildFreshSessionNonce() {
  return randomUUID();
}
