import { NextResponse } from "next/server";
import {
  buildFreshSessionNonce,
  DEVICE_COOLDOWN_MS,
  deviceDocRef,
  requireUidFromRequest,
  securityDocRef,
} from "@/lib/server-security";
import { adminDb } from "@/lib/firebase-admin";

type SecurityRouteData = {
  activeDeviceId?: string | null;
  activeDeviceLabel?: string | null;
  sessionNonce?: string | null;
  deviceChangeAvailableAt?: number | null;
  [key: string]: unknown;
};

export async function POST(req: Request) {
  try {
    const uid = await requireUidFromRequest(req);
    const body = await req.json();

    const deviceId = String(body?.deviceId || "").trim();
    const deviceLabel = String(body?.deviceLabel || "").trim() || null;
    const userAgent = String(body?.userAgent || "").trim() || null;
    const timezone = String(body?.timezone || "").trim() || null;
    const language = String(body?.language || "").trim() || null;
    const platform = String(body?.platform || "").trim() || null;
    const confidence = typeof body?.confidence === "number" ? body.confidence : null;

    if (!deviceId || deviceId.length < 8) {
      return NextResponse.json({ error: "deviceId invalid" }, { status: 400 });
    }

    const now = Date.now();
    const secRef = securityDocRef(uid);
    const thisDeviceRef = deviceDocRef(uid, deviceId);

    let action: "ok" | "transferred" = "ok";
    let newSecurityData: SecurityRouteData | null = null;

    await adminDb.runTransaction(async (tx) => {
      const secSnap = await tx.get(secRef);
      const current = secSnap.exists ? secSnap.data() : null;
      const newSessionNonce = buildFreshSessionNonce();

      if (!current?.activeDeviceId) {
        newSecurityData = {
          activeDeviceId: deviceId,
          activeDeviceLabel: deviceLabel ?? null,
          sessionNonce: newSessionNonce,
          deviceLockedAt: now,
          deviceChangeAvailableAt: now + DEVICE_COOLDOWN_MS,
          lastLoginAt: now,
          lastSeenAt: now,
          lastUserAgent: userAgent,
          lastTimezone: timezone,
          lastLanguage: language,
          lastPlatform: platform,
          failedTakeoverCount: 0,
          updatedAt: now,
        };

        tx.set(secRef, newSecurityData, { merge: true });
        tx.set(
          thisDeviceRef,
          {
            deviceId,
            label: deviceLabel,
            userAgent,
            timezone,
            language,
            platform,
            confidence,
            firstSeenAt: now,
            lastSeenAt: now,
            isActive: true,
            revokedAt: null,
            updatedAt: now,
          },
          { merge: true }
        );
        return;
      }

      if (current.activeDeviceId === deviceId) {
        newSecurityData = {
          activeDeviceId: deviceId,
          activeDeviceLabel: (deviceLabel ?? current.activeDeviceLabel ?? null) as string | null,
          sessionNonce: current.sessionNonce || newSessionNonce,
          deviceChangeAvailableAt: current.deviceChangeAvailableAt ?? null,
          lastLoginAt: now,
          lastSeenAt: now,
          lastUserAgent: userAgent,
          lastTimezone: timezone,
          lastLanguage: language,
          lastPlatform: platform,
          updatedAt: now,
        };

        tx.set(secRef, newSecurityData, { merge: true });
        tx.set(
          thisDeviceRef,
          {
            deviceId,
            label: deviceLabel,
            userAgent,
            timezone,
            language,
            platform,
            confidence,
            lastSeenAt: now,
            isActive: true,
            revokedAt: null,
            updatedAt: now,
          },
          { merge: true }
        );
        return;
      }

      if (now < (current.deviceChangeAvailableAt || 0)) {
        tx.set(
          secRef,
          {
            failedTakeoverCount: (current.failedTakeoverCount || 0) + 1,
            lastSeenAt: now,
            updatedAt: now,
          },
          { merge: true }
        );
        throw new Error("DEVICE_LOCKED");
      }

      action = "transferred";
      newSecurityData = {
        activeDeviceId: deviceId,
        activeDeviceLabel: deviceLabel ?? null,
        sessionNonce: newSessionNonce,
        deviceLockedAt: now,
        deviceChangeAvailableAt: now + DEVICE_COOLDOWN_MS,
        lastLoginAt: now,
        lastSeenAt: now,
        lastUserAgent: userAgent,
        lastTimezone: timezone,
        lastLanguage: language,
        lastPlatform: platform,
        failedTakeoverCount: 0,
        updatedAt: now,
      };

      const previousDeviceId = String(current.activeDeviceId || "");
      if (previousDeviceId) {
        tx.set(
          deviceDocRef(uid, previousDeviceId),
          {
            isActive: false,
            revokedAt: now,
            updatedAt: now,
          },
          { merge: true }
        );
      }

      tx.set(secRef, newSecurityData, { merge: true });
      tx.set(
        thisDeviceRef,
        {
          deviceId,
          label: deviceLabel,
          userAgent,
          timezone,
          language,
          platform,
          confidence,
          firstSeenAt: now,
          lastSeenAt: now,
          isActive: true,
          revokedAt: null,
          updatedAt: now,
        },
        { merge: true }
      );
    });

    return NextResponse.json({
      ok: true,
      status: action,
      sessionNonce: newSecurityData?.sessionNonce ?? null,
      activeDeviceId: newSecurityData?.activeDeviceId ?? null,
      activeDeviceLabel: newSecurityData?.activeDeviceLabel ?? null,
      deviceChangeAvailableAt: newSecurityData?.deviceChangeAvailableAt ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DEVICE_LOCKED") {
      return NextResponse.json(
        {
          error:
            "Contul este deja activ pe alt browser/dispozitiv. Îl poți muta după expirarea ferestrei de 48h sau din pagina Security de pe dispozitivul curent.",
          code: "DEVICE_LOCKED",
        },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === "Missing auth token") {
      return NextResponse.json({ error: "Autentificare invalidă." }, { status: 401 });
    }

    console.error("security/session", error);
    return NextResponse.json({ error: "Eroare la înregistrarea sesiunii." }, { status: 500 });
  }
}