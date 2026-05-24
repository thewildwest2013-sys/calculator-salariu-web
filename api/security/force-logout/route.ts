import { NextResponse } from "next/server";
import {
  buildFreshSessionNonce,
  deviceDocRef,
  readSecurityDoc,
  requireUidFromRequest,
  securityDocRef,
} from "@/lib/server-security";

export async function POST(req: Request) {
  try {
    const uid = await requireUidFromRequest(req);
    const body = await req.json();
    const keepDeviceId = String(body?.keepDeviceId || "").trim();

    if (!keepDeviceId) {
      return NextResponse.json({ error: "Lipsește dispozitivul curent." }, { status: 400 });
    }

    const security = await readSecurityDoc(uid);
    if (!security || security.activeDeviceId !== keepDeviceId) {
      return NextResponse.json({ error: "Poți forța logout doar de pe dispozitivul activ." }, { status: 403 });
    }

    const now = Date.now();
    const sessionNonce = buildFreshSessionNonce();

    await securityDocRef(uid).set(
      {
        sessionNonce,
        lastSeenAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    await deviceDocRef(uid, keepDeviceId).set(
      {
        isActive: true,
        revokedAt: null,
        lastSeenAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      sessionNonce,
      activeDeviceId: keepDeviceId,
      deviceChangeAvailableAt: security.deviceChangeAvailableAt ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Missing auth token") {
      return NextResponse.json({ error: "Autentificare invalidă." }, { status: 401 });
    }

    console.error("security/force-logout", error);
    return NextResponse.json({ error: "Eroare la închiderea celorlalte sesiuni." }, { status: 500 });
  }
}
