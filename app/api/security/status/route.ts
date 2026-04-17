import { NextResponse } from "next/server";
import { requireUidFromRequest, readSecurityDoc } from "@/lib/server-security";

export async function POST(req: Request) {
  try {
    const uid = await requireUidFromRequest(req);
    const body = await req.json();
    const deviceId = String(body?.deviceId || "").trim();
    const sessionNonce = String(body?.sessionNonce || "").trim();

    const security = await readSecurityDoc(uid);

    if (!security) {
      return NextResponse.json({
        ok: true,
        valid: false,
        activeDeviceId: null,
        sessionNonce: null,
        activeDeviceLabel: null,
        deviceChangeAvailableAt: null,
        canRequestImmediateChange: false,
      });
    }

    const valid = Boolean(
      security.activeDeviceId &&
        security.sessionNonce &&
        security.activeDeviceId === deviceId &&
        security.sessionNonce === sessionNonce
    );

    return NextResponse.json({
      ok: true,
      valid,
      activeDeviceId: security.activeDeviceId ?? null,
      sessionNonce: security.sessionNonce ?? null,
      activeDeviceLabel: security.activeDeviceLabel ?? null,
      deviceChangeAvailableAt: security.deviceChangeAvailableAt ?? null,
      canRequestImmediateChange: security.activeDeviceId === deviceId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Missing auth token") {
      return NextResponse.json({ error: "Autentificare invalidă." }, { status: 401 });
    }

    console.error("security/status", error);
    return NextResponse.json({ error: "Eroare la verificarea sesiunii." }, { status: 500 });
  }
}
