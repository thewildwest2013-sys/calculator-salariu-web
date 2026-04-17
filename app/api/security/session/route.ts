import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

const DEVICE_CHANGE_LOCK_HOURS = 48;

type SecurityDoc = {
  activeDeviceId: string | null;
  activeDeviceLabel: string | null;
  sessionNonce: string | null;
  deviceChangeAvailableAt: string | null;
  updatedAt: string | null;
};

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const uid = body?.uid;
    const deviceId = body?.deviceId;
    const deviceLabel = body?.deviceLabel || "Browser web";
    const forceTransfer = body?.forceTransfer === true;

    if (!uid || !deviceId) {
      return NextResponse.json(
        { error: "Missing uid or deviceId" },
        { status: 400 }
      );
    }

    const securityRef = adminDb.doc(`users/${uid}/security/main`);
    const now = new Date();
    const nowIso = now.toISOString();

    const snap = await securityRef.get();
    const current = snap.exists ? (snap.data() as Partial<SecurityDoc>) : null;

    const activeDeviceId = current?.activeDeviceId ?? null;
    const deviceChangeAvailableAt = current?.deviceChangeAvailableAt
      ? new Date(current.deviceChangeAvailableAt)
      : null;

    let action: "created" | "same_device" | "blocked" | "transferred" = "created";

    let newSecurityData: SecurityDoc = {
      activeDeviceId: deviceId,
      activeDeviceLabel: deviceLabel,
      sessionNonce: crypto.randomUUID(),
      deviceChangeAvailableAt: addHours(now, DEVICE_CHANGE_LOCK_HOURS).toISOString(),
      updatedAt: nowIso,
    };

    // Primul login web
    if (!snap.exists || !activeDeviceId) {
      await securityRef.set(newSecurityData, { merge: true });

      return NextResponse.json({
        ok: true,
        status: "created",
        sessionNonce: newSecurityData.sessionNonce,
        activeDeviceId: newSecurityData.activeDeviceId,
        activeDeviceLabel: newSecurityData.activeDeviceLabel,
        deviceChangeAvailableAt: newSecurityData.deviceChangeAvailableAt,
      });
    }

    // Același browser/dispozitiv
    if (activeDeviceId === deviceId) {
      action = "same_device";

      newSecurityData = {
        activeDeviceId,
        activeDeviceLabel: current?.activeDeviceLabel ?? deviceLabel,
        sessionNonce: current?.sessionNonce ?? crypto.randomUUID(),
        deviceChangeAvailableAt:
          current?.deviceChangeAvailableAt ??
          addHours(now, DEVICE_CHANGE_LOCK_HOURS).toISOString(),
        updatedAt: nowIso,
      };

      await securityRef.set(newSecurityData, { merge: true });

      return NextResponse.json({
        ok: true,
        status: action,
        sessionNonce: newSecurityData.sessionNonce,
        activeDeviceId: newSecurityData.activeDeviceId,
        activeDeviceLabel: newSecurityData.activeDeviceLabel,
        deviceChangeAvailableAt: newSecurityData.deviceChangeAvailableAt,
      });
    }

    // Alt browser și încă e blocat
    if (!forceTransfer && deviceChangeAvailableAt && now < deviceChangeAvailableAt) {
      return NextResponse.json(
        {
          ok: false,
          error: "DEVICE_LOCKED",
          activeDeviceId,
          activeDeviceLabel: current?.activeDeviceLabel ?? null,
          deviceChangeAvailableAt: current?.deviceChangeAvailableAt ?? null,
        },
        { status: 403 }
      );
    }

    // Transfer pe alt browser
    action = "transferred";

    newSecurityData = {
      activeDeviceId: deviceId,
      activeDeviceLabel: deviceLabel,
      sessionNonce: crypto.randomUUID(),
      deviceChangeAvailableAt: addHours(now, DEVICE_CHANGE_LOCK_HOURS).toISOString(),
      updatedAt: nowIso,
    };

    await securityRef.set(newSecurityData, { merge: true });

    return NextResponse.json({
      ok: true,
      status: action,
      sessionNonce: newSecurityData.sessionNonce,
      activeDeviceId: newSecurityData.activeDeviceId,
      activeDeviceLabel: newSecurityData.activeDeviceLabel,
      deviceChangeAvailableAt: newSecurityData.deviceChangeAvailableAt,
    });
  } catch (error) {
    console.error("Security session error:", error);
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}