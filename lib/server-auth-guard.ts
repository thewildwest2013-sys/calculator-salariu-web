import { adminAuth, adminDb } from "@/lib/firebase-admin";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

export async function requireValidWebSession(req: Request) {
  const token = getBearerToken(req);
  if (!token) throw new Error("UNAUTHENTICATED");

  const deviceId = (req.headers.get("x-device-id") || "").trim();
  const sessionNonce = (req.headers.get("x-session-nonce") || "").trim();

  if (!deviceId || !sessionNonce) {
    throw new Error("MISSING_SESSION_HEADERS");
  }

  const decoded = await adminAuth.verifyIdToken(token);
  const uid = decoded.uid;

  const secSnap = await adminDb.doc(`users/${uid}/security/main`).get();
  if (!secSnap.exists) throw new Error("SECURITY_PROFILE_NOT_FOUND");

  const sec = secSnap.data() || {};

  if (sec.activeDeviceId !== deviceId) {
    throw new Error("DEVICE_MISMATCH");
  }

  if (sec.sessionNonce !== sessionNonce) {
    throw new Error("SESSION_INVALID");
  }

  return { uid, email: decoded.email || null };
}