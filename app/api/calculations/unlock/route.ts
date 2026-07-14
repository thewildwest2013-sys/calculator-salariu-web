import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";
import { adminDb, FieldValue } from "@/lib/firebase-admin";

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
const SAFE_ID = /^[a-zA-Z0-9_-]{1,80}$/;

function safeSnapshot(value: unknown) {
  const serialized = JSON.stringify(value ?? {});
  if (serialized.length > 180_000) throw new Error("CALCULATION_TOO_LARGE");
  return JSON.parse(serialized) as Record<string, unknown>;
}

export async function POST(req: Request) {
  try {
    const session = await requireValidWebSession(req);
    const body = await req.json().catch(() => ({}));
    const monthKey = String(body?.monthKey || "");
    const profileId = String(body?.profileId || "default");
    if (!MONTH_KEY.test(monthKey) || !SAFE_ID.test(profileId)) {
      return NextResponse.json({ error: "INVALID_CALCULATION_KEY" }, { status: 400 });
    }

    const snapshot = safeSnapshot(body?.snapshot);
    const userRef = adminDb.doc(`users/${session.uid}`);
    const calculationRef = adminDb.doc(`users/${session.uid}/monthlyCalculations/${profileId}_${monthKey}`);

    const result = await adminDb.runTransaction(async (tx) => {
      const [userSnap, calculationSnap] = await Promise.all([tx.get(userRef), tx.get(calculationRef)]);
      const user = userSnap.data() || {};
      const now = new Date().toISOString();

      if (calculationSnap.exists && calculationSnap.data()?.unlocked === true) {
        tx.set(calculationRef, { snapshot, updatedAt: now, calculationVersion: snapshot.calculationVersion || null }, { merge: true });
        return { unlocked: true, source: calculationSnap.data()?.unlockSource || "existing", consumed: false };
      }

      const subscriptionActive = user.entitlementActive === true || ["active", "trialing"].includes(String(user.subscriptionStatus || ""));
      let source = "";
      if (subscriptionActive) {
        source = "subscription";
      } else if (Number(user.credits || 0) > 0) {
        source = "credit";
        tx.set(userRef, { credits: FieldValue.increment(-1), updatedAt: now }, { merge: true });
        tx.set(adminDb.doc(`users/${session.uid}/creditTransactions/unlock_${profileId}_${monthKey}`), {
          type: "calculation_unlock",
          amount: -1,
          profileId,
          monthKey,
          createdAt: now,
        });
      } else {
        throw new Error("PAYMENT_REQUIRED");
      }

      tx.set(calculationRef, {
        profileId,
        monthKey,
        unlocked: true,
        unlockSource: source,
        snapshot,
        createdAt: now,
        updatedAt: now,
        calculationVersion: snapshot.calculationVersion || null,
      });
      return { unlocked: true, source, consumed: source === "credit" };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "UNLOCK_FAILED";
    const status = message === "PAYMENT_REQUIRED" ? 402 : ["UNAUTHENTICATED", "MISSING_SESSION_HEADERS"].includes(message) ? 401 : ["DEVICE_MISMATCH", "SESSION_INVALID", "SECURITY_PROFILE_NOT_FOUND"].includes(message) ? 403 : message.startsWith("INVALID_") || message === "CALCULATION_TOO_LARGE" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
