import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function deleteCollection(path: string) {
  const snapshot = await adminDb.collection(path).get();

  if (snapshot.empty) return;

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Lipsește autorizarea." },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    await deleteCollection(`users/${uid}/profile`);
    await deleteCollection(`users/${uid}/usage`);
    await deleteCollection(`users/${uid}/payments`);
    await deleteCollection(`users/${uid}/history`);
    await deleteCollection(`users/${uid}/calculations`);

    await adminDb.collection("users").doc(uid).delete();
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ ok: true, message: "Contul a fost șters." });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Nu am putut șterge contul." },
      { status: 500 },
    );
  }
}
