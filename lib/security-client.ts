"use client";

import { auth } from "@/lib/firebase";
import { getWebDeviceFingerprint } from "@/lib/device";

const SESSION_NONCE_KEY = "security.sessionNonce.v1";
const ACTIVE_DEVICE_KEY = "security.activeDeviceId.v1";

export type SecurityStatusResponse = {
  ok: boolean;
  valid: boolean;
  activeDeviceId: string | null;
  sessionNonce: string | null;
  activeDeviceLabel: string | null;
  deviceChangeAvailableAt: number | null;
  canRequestImmediateChange: boolean;
};

export type RegisterBrowserSessionResponse = {
  ok: true;
  status: "created" | "same_device" | "transferred";
  sessionNonce: string;
  activeDeviceId: string;
  activeDeviceLabel: string | null;
  deviceChangeAvailableAt: number | null;
};

export type ForceLogoutResponse = {
  ok: true;
  sessionNonce: string;
  activeDeviceId: string;
  deviceChangeAvailableAt: number | null;
};

export type RequestImmediateDeviceChangeResponse = {
  ok: true;
  deviceChangeAvailableAt: number;
  unlockedNow: boolean;
};

function getStoredValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStoredValue(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (value == null) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
}

export function getStoredSessionNonce() {
  return getStoredValue(SESSION_NONCE_KEY);
}

export function clearStoredSecurityState() {
  setStoredValue(SESSION_NONCE_KEY, null);
  setStoredValue(ACTIVE_DEVICE_KEY, null);
}

async function authHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Nu există utilizator autentificat.");
  }

  const token = await user.getIdToken(true);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function registerBrowserSession(): Promise<RegisterBrowserSessionResponse> {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Nu există utilizator autentificat.");
  }

  const res = await fetch("/api/security/session", {
    method: "POST",
    headers,
    body: JSON.stringify({
      uid: user.uid,
      deviceId: fp.deviceId,
      deviceLabel: fp.deviceLabel,
      userAgent: fp.userAgent,
      timezone: fp.timezone,
      language: fp.language,
      platform: fp.platform,
      confidence: fp.confidence,
    }),
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const errorMessage = typeof data === "object" && data !== null && "error" in data ? String((data as { error?: unknown }).error || "") : "";
    throw new Error(errorMessage || "Nu am putut înregistra sesiunea.");
  }

  const result = data as RegisterBrowserSessionResponse;
  setStoredValue(SESSION_NONCE_KEY, result.sessionNonce ?? null);
  setStoredValue(ACTIVE_DEVICE_KEY, result.activeDeviceId ?? fp.deviceId);

  return result;
}

export async function getSecurityStatus(): Promise<SecurityStatusResponse> {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();
  const sessionNonce = getStoredSessionNonce();

  const res = await fetch("/api/security/status", {
    method: "POST",
    headers,
    body: JSON.stringify({
      deviceId: fp.deviceId,
      sessionNonce,
    }),
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const errorMessage = typeof data === "object" && data !== null && "error" in data ? String((data as { error?: unknown }).error || "") : "";
    throw new Error(errorMessage || "Nu am putut verifica sesiunea.");
  }

  return data as SecurityStatusResponse;
}

export async function forceLogoutOtherSessions(): Promise<ForceLogoutResponse> {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();

  const res = await fetch("/api/security/force-logout", {
    method: "POST",
    headers,
    body: JSON.stringify({
      keepDeviceId: fp.deviceId,
    }),
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const errorMessage = typeof data === "object" && data !== null && "error" in data ? String((data as { error?: unknown }).error || "") : "";
    throw new Error(errorMessage || "Nu am putut închide celelalte sesiuni.");
  }

  const result = data as ForceLogoutResponse;
  setStoredValue(SESSION_NONCE_KEY, result.sessionNonce ?? null);
  setStoredValue(ACTIVE_DEVICE_KEY, result.activeDeviceId ?? fp.deviceId);

  return result;
}

export async function requestImmediateDeviceChange(): Promise<RequestImmediateDeviceChangeResponse> {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();

  const res = await fetch("/api/security/request-device-change", {
    method: "POST",
    headers,
    body: JSON.stringify({
      currentDeviceId: fp.deviceId,
    }),
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const errorMessage = typeof data === "object" && data !== null && "error" in data ? String((data as { error?: unknown }).error || "") : "";
    throw new Error(errorMessage || "Nu am putut activa schimbarea browserului.");
  }

  return data as RequestImmediateDeviceChangeResponse;
}
