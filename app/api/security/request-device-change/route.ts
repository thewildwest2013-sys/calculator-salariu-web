import { NextResponse } from "next/server";
import { readSecurityDoc, requireUidFromRequest, securityDocRef } from "@/lib/server-security";

export async function POST(req: Request) {
  try {
    const uid = await requireUidFromRequest(req);
    const body = await req.json();
    const currentDeviceId = String(body?.currentDeviceId || "").trim();

    const security = await readSecurityDoc(uid);
    if (!security || !security.activeDeviceId) {
      return NextResponse.json({ error: "Nu există un dispozitiv activ înregistrat." }, { status: 404 });
    }

    if (security.activeDeviceId !== currentDeviceId) {
      return NextResponse.json({ error: "Această acțiune se poate face doar de pe browserul activ." }, { status: 403 });
    }

    const now = Date.now();
    await securityDocRef(uid).set(
      {
        deviceChangeAvailableAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      unlockedNow: true,
      deviceChangeAvailableAt: now,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Missing auth token") {
      return NextResponse.json({ error: "Autentificare invalidă." }, { status: 401 });
    }

    console.error("security/request-device-change", error);
    return NextResponse.json({ error: "Eroare la activarea schimbării de dispozitiv." }, { status: 500 });
  }
}
