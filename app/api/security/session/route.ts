import { NextResponse } from "next/server";
import { buildFreshSessionNonce, deviceDocRef, requireUidFromRequest, securityDocRef } from "@/lib/server-security";

const DEVICE_CHANGE_LOCK_MS = 48 * 60 * 60 * 1000;
type SecurityDoc = { activeDeviceId?: string|null; activeDeviceLabel?: string|null; sessionNonce?: string|null; deviceChangeAvailableAt?: number|null };

export async function POST(req: Request) {
  try {
    const uid = await requireUidFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (body?.uid && String(body.uid) !== uid) return NextResponse.json({ error: "UID_MISMATCH" }, { status: 403 });
    const deviceId = String(body?.deviceId || "").trim();
    const deviceLabel = String(body?.deviceLabel || "Browser web").trim().slice(0, 120);
    if (!deviceId) return NextResponse.json({ error: "MISSING_DEVICE_ID" }, { status: 400 });

    const ref = securityDocRef(uid);
    const snap = await ref.get();
    const current = snap.exists ? snap.data() as SecurityDoc : null;
    const now = Date.now();
    const activeDeviceId = current?.activeDeviceId || null;

    if (activeDeviceId && activeDeviceId !== deviceId && Number(current?.deviceChangeAvailableAt || 0) > now) {
      return NextResponse.json({ error: "DEVICE_LOCKED", deviceChangeAvailableAt: current?.deviceChangeAvailableAt }, { status: 423 });
    }

    if (!activeDeviceId || activeDeviceId !== deviceId) {
      const sessionNonce = buildFreshSessionNonce();
      const availableAt = now + DEVICE_CHANGE_LOCK_MS;
      const batch = ref.firestore.batch();
      if (activeDeviceId) batch.set(deviceDocRef(uid, activeDeviceId), { isActive:false, revokedAt:now, updatedAt:now }, { merge:true });
      batch.set(ref, { activeDeviceId:deviceId, activeDeviceLabel:deviceLabel, sessionNonce, deviceLockedAt:now, deviceChangeAvailableAt:availableAt, lastLoginAt:now, lastSeenAt:now, updatedAt:now }, { merge:true });
      batch.set(deviceDocRef(uid, deviceId), { isActive:true, deviceLabel, userAgent:String(body?.userAgent||"").slice(0,500), timezone:String(body?.timezone||"").slice(0,100), language:String(body?.language||"").slice(0,50), platform:String(body?.platform||"").slice(0,100), firstSeenAt:now, lastSeenAt:now, updatedAt:now }, { merge:true });
      await batch.commit();
      return NextResponse.json({ ok:true, status:activeDeviceId?"transferred":"created", sessionNonce, activeDeviceId:deviceId, activeDeviceLabel:deviceLabel, deviceChangeAvailableAt:availableAt });
    }

    const sessionNonce = current?.sessionNonce || buildFreshSessionNonce();
    const availableAt = current?.deviceChangeAvailableAt || now + DEVICE_CHANGE_LOCK_MS;
    await Promise.all([
      ref.set({ sessionNonce, lastSeenAt:now, updatedAt:now }, { merge:true }),
      deviceDocRef(uid, deviceId).set({ isActive:true, lastSeenAt:now, updatedAt:now }, { merge:true }),
    ]);
    return NextResponse.json({ ok:true, status:"same_device", sessionNonce, activeDeviceId:deviceId, activeDeviceLabel:current?.activeDeviceLabel || deviceLabel, deviceChangeAvailableAt:availableAt });
  } catch (error) {
    if (error instanceof Error && error.message === "Missing auth token") return NextResponse.json({ error:"UNAUTHENTICATED" }, { status:401 });
    console.error("security/session", error);
    return NextResponse.json({ error:"SERVER_ERROR" }, { status:500 });
  }
}
