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

export async function registerBrowserSession() {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();

  const res = await fetch("/api/security/session", {
    method: "POST",
    headers,
    body: JSON.stringify({
      deviceId: fp.deviceId,
      deviceLabel: fp.deviceLabel,
      userAgent: fp.userAgent,
      timezone: fp.timezone,
      language: fp.language,
      platform: fp.platform,
      confidence: fp.confidence,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Nu am putut înregistra sesiunea.");
  }

  setStoredValue(SESSION_NONCE_KEY, data.sessionNonce ?? null);
  setStoredValue(ACTIVE_DEVICE_KEY, data.activeDeviceId ?? fp.deviceId);

  return data as {
    ok: true;
    status: "ok" | "transferred";
    sessionNonce: string;
    activeDeviceId: string;
    activeDeviceLabel: string | null;
    deviceChangeAvailableAt: number | null;
  };
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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Nu am putut verifica sesiunea.");
  }

  return data as SecurityStatusResponse;
}

export async function forceLogoutOtherSessions() {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();

  const res = await fetch("/api/security/force-logout", {
    method: "POST",
    headers,
    body: JSON.stringify({
      keepDeviceId: fp.deviceId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Nu am putut închide celelalte sesiuni.");
  }

  setStoredValue(SESSION_NONCE_KEY, data.sessionNonce ?? null);
  setStoredValue(ACTIVE_DEVICE_KEY, data.activeDeviceId ?? fp.deviceId);

  return data as {
    ok: true;
    sessionNonce: string;
    activeDeviceId: string;
    deviceChangeAvailableAt: number | null;
  };
}

export async function requestImmediateDeviceChange() {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();

  const res = await fetch("/api/security/request-device-change", {
    method: "POST",
    headers,
    body: JSON.stringify({
      currentDeviceId: fp.deviceId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Nu am putut activa schimbarea dispozitivului.");
  }

  return data as {
    ok: true;
    deviceChangeAvailableAt: number;
    unlockedNow: boolean;
  };
}
