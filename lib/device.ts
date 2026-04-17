import FingerprintJS from "@fingerprintjs/fingerprintjs";

export type WebDeviceFingerprint = {
  deviceId: string;
  deviceLabel: string;
  userAgent: string;
  timezone: string;
  language: string;
  platform: string;
  confidence: number | null;
};

let cachedPromise: Promise<WebDeviceFingerprint> | null = null;

export async function getWebDeviceFingerprint(): Promise<WebDeviceFingerprint> {
  if (typeof window === "undefined") {
    throw new Error("Fingerprint-ul poate fi generat doar în browser.");
  }

  if (!cachedPromise) {
    cachedPromise = (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
      const userAgent = navigator.userAgent || "unknown";
      const platform = navigator.platform || "unknown";
      const language = navigator.language || "unknown";

      return {
        deviceId: result.visitorId,
        deviceLabel: `${platform} • ${timezone}`,
        userAgent,
        timezone,
        language,
        platform,
        confidence: result.confidence?.score ?? null,
      };
    })();
  }

  return cachedPromise;
}
