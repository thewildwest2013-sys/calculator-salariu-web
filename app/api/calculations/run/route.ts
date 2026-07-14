import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { getFiscalRulesForDate } from "@/lib/payroll/fiscal-rules";
import { getRomanianHolidaySet } from "@/lib/payroll/holidays";
import { calculatePayroll } from "@/lib/payroll/payroll-engine";
import type { CalendarEntry, PayrollSettings, ShiftDefinition } from "@/lib/payroll/types";

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
const SAFE_ID = /^[a-zA-Z0-9_-]{1,100}$/;
const MAIN_PROFILE_IDS = new Set(["default", "main"]);

function safeJson<T>(value: unknown, maxLength = 180_000): T {
  const serialized = JSON.stringify(value ?? null);
  if (serialized.length > maxLength) throw new Error("CALCULATION_TOO_LARGE");
  return JSON.parse(serialized) as T;
}

function isSubscriptionActive(user: Record<string, unknown>) {
  return user.entitlementActive === true || ["active", "trialing"].includes(String(user.subscriptionStatus || ""));
}

export async function POST(req: Request) {
  try {
    const session = await requireValidWebSession(req);
    const body = await req.json().catch(() => ({}));

    const requestId = String(body?.requestId || "");
    const monthKey = String(body?.monthKey || "");
    const profileId = String(body?.profileId || "default");
    const mode = String(body?.mode || "standard");

    if (!SAFE_ID.test(requestId) || !MONTH_KEY.test(monthKey) || !SAFE_ID.test(profileId)) {
      return NextResponse.json({ error: "INVALID_CALCULATION_KEY" }, { status: 400 });
    }

    const entries = safeJson<CalendarEntry[]>(body?.entries);
    const shifts = safeJson<ShiftDefinition[]>(body?.shifts);
    const settings = safeJson<PayrollSettings>(body?.settings);

    if (!Array.isArray(entries) || !Array.isArray(shifts) || !settings || typeof settings !== "object") {
      return NextResponse.json({ error: "INVALID_CALCULATION_INPUT" }, { status: 400 });
    }

    const year = Number(monthKey.slice(0, 4));
    const rules = getFiscalRulesForDate(`${monthKey}-01`);
    const holidays = getRomanianHolidaySet(year);
    const result = calculatePayroll({ entries, shifts, settings, rules, holidays });

    const userRef = adminDb.doc(`users/${session.uid}`);
    const calculationRef = adminDb.doc(`users/${session.uid}/calculations/${requestId}`);
    const transactionRef = adminDb.doc(`users/${session.uid}/creditTransactions/calculation_${requestId}`);
    const now = new Date().toISOString();

    const transactionResult = await adminDb.runTransaction(async (tx) => {
      const [userSnap, existingCalculation] = await Promise.all([tx.get(userRef), tx.get(calculationRef)]);
      const user = (userSnap.data() || {}) as Record<string, unknown>;

      // Protecție la dublu click / retry de rețea: aceeași cerere nu consumă încă un credit.
      if (existingCalculation.exists) {
        const existing = existingCalculation.data() || {};
        return {
          calculationId: requestId,
          source: String(existing.source || "existing"),
          consumed: false,
          result: existing.snapshot?.result || result,
          duplicate: true,
        };
      }

      const subscriptionActive = isSubscriptionActive(user);
      let source: "subscription" | "credit";

      if (subscriptionActive) {
        source = "subscription";
      } else {
        if (!MAIN_PROFILE_IDS.has(profileId)) throw new Error("PROFILE_REQUIRES_PREMIUM");
        if (Number(user.credits || 0) <= 0) throw new Error("PAYMENT_REQUIRED");
        source = "credit";
        tx.set(userRef, { credits: FieldValue.increment(-1), updatedAt: now }, { merge: true });
        tx.set(transactionRef, {
          type: "calculation_run",
          amount: -1,
          profileId,
          monthKey,
          calculationId: requestId,
          createdAt: now,
        });
      }

      tx.set(calculationRef, {
        requestId,
        profileId,
        monthKey,
        mode,
        source,
        calculationVersion: result.calculationVersion,
        snapshot: {
          mode,
          entries,
          shifts,
          settings,
          result,
        },
        createdAt: now,
        updatedAt: now,
      });

      return {
        calculationId: requestId,
        source,
        consumed: source === "credit",
        result,
        duplicate: false,
      };
    });

    return NextResponse.json(transactionResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "CALCULATION_FAILED";
    const status = message === "PAYMENT_REQUIRED"
      ? 402
      : message === "PROFILE_REQUIRES_PREMIUM"
        ? 403
        : ["UNAUTHENTICATED", "MISSING_SESSION_HEADERS"].includes(message)
          ? 401
          : ["DEVICE_MISMATCH", "SESSION_INVALID", "SECURITY_PROFILE_NOT_FOUND"].includes(message)
            ? 403
            : message.startsWith("INVALID_") || message === "CALCULATION_TOO_LARGE"
              ? 400
              : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
