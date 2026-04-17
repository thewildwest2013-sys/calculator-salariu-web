import { NextResponse } from "next/server";
import { requireUidFromRequest, securityDocRef } from "@/lib/server-security";

const DEVICE_CHANGE_LOCK_MS = 48 * 60 * 60 * 1000;

type SecurityDoc = {
  activeDeviceId?: string | null;
  activeDeviceLabel?: string | null;
  sessionNonce?: string | null;
  deviceChangeAvailableAt?: number | null;
  updatedAt?: number;
};

export async function POST(req: Request) {
  try {
    const uid = await requireUidFromRequest(req);
    const body = await req.json().catch(() => null);

    const bodyUid = String(body?.uid || "").trim();
    if (bodyUid && bodyUid !== uid) {
      return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
    }

    const deviceId = String(body?.deviceId || "").trim();
    const deviceLabel = String(body?.deviceLabel || "Browser web").trim();
    const forceTransfer = body?.forceTransfer === true;

    if (!deviceId) {
      return NextResponse.json({ error: "Missing uid or deviceId" }, { status: 400 });
    }

    const ref = securityDocRef(uid);
    const snap = await ref.get();
    const current = snap.exists ? (snap.data() as SecurityDoc) : null;
    const now = Date.now();

    const activeDeviceId = current?.activeDeviceId ?? null;
    const deviceChangeAvailableAt = current?.deviceChangeAvailableAt ?? null;

    const sessionNonce = crypto.randomUUID();
    const nextDeviceChangeAvailableAt = now + DEVICE_CHANGE_LOCK_MS;

    if (!activeDeviceId) {
      await ref.set(
        {
          activeDeviceId: deviceId,
          activeDeviceLabel: deviceLabel,
          sessionNonce,
          deviceChangeAvailableAt: nextDeviceChangeAvailableAt,
          updatedAt: now,
          lastSeenAt: now,
          lastLoginAt: now,
        },
        { merge: true }
      );

      return NextResponse.json({
        ok: true,
        status: "created",
        sessionNonce,
        activeDeviceId: deviceId,
        activeDeviceLabel: deviceLabel,
        deviceChangeAvailableAt: nextDeviceChangeAvailableAt,
      });
    }

    if (activeDeviceId === deviceId) {
      const nonce = current?.sessionNonce ?? sessionNonce;
      const availableAt = current?.deviceChangeAvailableAt ?? nextDeviceChangeAvailableAt;

      await ref.set(
        {
          activeDeviceId,
          activeDeviceLabel: current?.activeDeviceLabel ?? deviceLabel,
          sessionNonce: nonce,
          deviceChangeAvailableAt: availableAt,
          updatedAt: now,
          lastSeenAt: now,
        },
        { merge: true }
      );

      return NextResponse.json({
        ok: true,
        status: "same_device",
        sessionNonce: nonce,
        activeDeviceId: activeDeviceId,
        activeDeviceLabel: current?.activeDeviceLabel ?? deviceLabel,
        deviceChangeAvailableAt: availableAt,
      });
    }

    if (!forceTransfer && deviceChangeAvailableAt && now < deviceChangeAvailableAt) {
      return NextResponse.json(
        {
          ok: false,
          error: "DEVICE_LOCKED",
          activeDeviceId,
          activeDeviceLabel: current?.activeDeviceLabel ?? null,
          deviceChangeAvailableAt,
        },
        { status: 403 }
      );
    }

    await ref.set(
      {
        activeDeviceId: deviceId,
        activeDeviceLabel: deviceLabel,
        sessionNonce,
        deviceChangeAvailableAt: nextDeviceChangeAvailableAt,
        updatedAt: now,
        lastSeenAt: now,
        lastLoginAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      status: "transferred",
      sessionNonce,
      activeDeviceId: deviceId,
      activeDeviceLabel: deviceLabel,
      deviceChangeAvailableAt: nextDeviceChangeAvailableAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Missing auth token") {
      return NextResponse.json({ error: "Autentificare invalidă." }, { status: 401 });
    }

    console.error("Security session error:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
