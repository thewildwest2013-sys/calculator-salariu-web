import Stripe from "stripe";
import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const session = await requireValidWebSession(req);
    if (Math.floor(Date.now() / 1000) - session.authTime > 10 * 60) {
      return NextResponse.json({ error: "REAUTH_REQUIRED" }, { status: 401 });
    }

    const ownedOrganizations = await adminDb.collection("organizations").where("ownerId", "==", session.uid).limit(1).get();
    if (!ownedOrganizations.empty) {
      return NextResponse.json({ error: "TRANSFER_OR_DELETE_COMPANY_FIRST" }, { status: 409 });
    }

    const userRef = adminDb.doc(`users/${session.uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};

    if (process.env.STRIPE_SECRET_KEY && userData.stripeSubscriptionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      await stripe.subscriptions.update(String(userData.stripeSubscriptionId), { cancel_at_period_end: true }).catch((error) => console.error("STRIPE_CANCEL_ON_DELETE", error));
    }

    const memberships = await adminDb.collectionGroup("members").where("userId", "==", session.uid).get();
    const batch = adminDb.batch();
    memberships.docs.forEach(member => batch.delete(member.ref));
    if (!memberships.empty) await batch.commit();

    await adminDb.recursiveDelete(userRef);
    await adminAuth.revokeRefreshTokens(session.uid);
    await adminAuth.deleteUser(session.uid);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "DELETE_FAILED";
    const status = ["UNAUTHENTICATED", "MISSING_SESSION_HEADERS"].includes(message) ? 401 : ["DEVICE_MISMATCH", "SESSION_INVALID", "SECURITY_PROFILE_NOT_FOUND"].includes(message) ? 403 : 500;
    console.error("DELETE_ACCOUNT", message);
    return NextResponse.json({ error: message }, { status });
  }
}
