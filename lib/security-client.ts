"use client";

import { auth } from "@/lib/firebase";

const ACTIVE_DEVICE_KEY = "active_device_id";

function setStoredValue(key: string, value: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged");

  const token = await user.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function getWebDeviceFingerprint() {
  return {
    deviceId: crypto.randomUUID(),
    deviceLabel: navigator.userAgent,
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    confidence: 0.5,
  };
}

export async function registerBrowserSession() {
  const fp = await getWebDeviceFingerprint();
  const headers = await authHeaders();

  const user = auth.currentUser;
  if (!user) throw new Error("User not logged");

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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Nu am putut înregistra sesiunea.");
  }

  setStoredValue(
    ACTIVE_DEVICE_KEY,
    data.activeDeviceId ?? fp.deviceId
  );

  return data;
}

export async function getSecurityStatus() {
  const headers = await authHeaders();

  const res = await fetch("/api/security/status", {
    method: "GET",
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Nu am putut obține statusul.");
  }

  return data;
}

export function clearStoredSecurityState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACTIVE_DEVICE_KEY);
  }
}