import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { runAI } from "@/lib/ai-provider";

const scheduleSystem = `Ești Asistent Salariu AI pentru România. Interpretezi descrieri de programe de lucru, dar NU calculezi taxe și NU dai verdicte juridice. Returnează exclusiv JSON valid cu forma: {"answer":"explicație scurtă în limba utilizatorului","schedule":{"cycleDays":number,"shifts":[{"code":string,"name":string,"startTime":"HH:MM","endTime":"HH:MM","count":number,"nightBonusRule":"legal_interval"|"whole_shift"|"fixed_hours"|"custom_interval"|"manual"}],"offDays":number},"warnings":[string],"requiresConfirmation":true}. Păstrează separat orele legale de noapte 22:00–06:00 de orele pentru care firma plătește spor. Nu inventa date lipsă; pune avertisment.`;
const explainSystem = `Ești Asistent Salariu AI. Explici numai datele numerice furnizate de motorul aplicației. Nu recalculezi CAS/CASS/impozit, nu inventezi valori, nu oferi verdict juridic. Returnează exclusiv JSON valid: {"answer":"explicație clară în limba utilizatorului","highlights":[string],"warnings":[string],"requiresConfirmation":false}.`;

function safeText(value: unknown, max = 5000) { return String(value || "").replace(/[\u0000-\u001F]/g, " ").slice(0, max); }
function monthlyLimit(plan: string | undefined) { if (plan?.includes("plus")) return 3500; if (plan?.includes("pro")) return 1500; if (plan?.includes("growth")) return 750; if (plan?.includes("starter")) return 300; if (plan?.includes("personal")) return 100; return 3; }

export async function POST(req: Request) {
  try {
    const session = await requireValidWebSession(req);
    const body = await req.json();
    const mode = body?.mode === "explain" ? "explain" : "schedule";
    const prompt = safeText(body?.prompt, 4000);
    if (prompt.length < 3) return NextResponse.json({ error: "PROMPT_TOO_SHORT" }, { status: 400 });

    const userRef = adminDb.doc(`users/${session.uid}`);
    const userSnap = await userRef.get();
    const limit = monthlyLimit(userSnap.data()?.plan);
    const monthKey = new Date().toISOString().slice(0, 7);
    const usageRef = adminDb.doc(`users/${session.uid}/aiUsage/${monthKey}`);

    await adminDb.runTransaction(async tx => {
      const usage = await tx.get(usageRef);
      const count = Number(usage.data()?.count || 0);
      if (count >= limit) throw new Error("AI_LIMIT_REACHED");
      tx.set(usageRef, { count: FieldValue.increment(1), limit, updatedAt: new Date().toISOString() }, { merge: true });
    });

    const context = mode === "explain" ? safeText(JSON.stringify(body?.context || {}), 8000) : "";
    const response = await runAI([
      { role: "system", content: mode === "schedule" ? scheduleSystem : explainSystem },
      { role: "user", content: mode === "explain" ? `Întrebare: ${prompt}\nDate calculate de aplicație: ${context}` : prompt },
    ]);

    let parsed: unknown;
    try { parsed = JSON.parse(response.text); } catch { throw new Error("AI_INVALID_JSON"); }
    return NextResponse.json({ data: parsed, provider: response.provider, model: response.model, limit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI_ERROR";
    const status = message === "AI_LIMIT_REACHED" ? 429 : ["UNAUTHENTICATED", "MISSING_SESSION_HEADERS"].includes(message) ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
