import Stripe from "stripe";
import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";
import { getPlan, getStripePriceId, isSubscriptionPlan } from "@/lib/plans";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const session = await requireValidWebSession(req);
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "MISSING_STRIPE_SECRET_KEY" }, { status: 500 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return NextResponse.json({ error: "MISSING_APP_URL" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const plan = getPlan(String(body?.planId || ""));
    if (!plan || plan.kind === "enterprise") return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });

    const priceId = getStripePriceId(plan);
    if (!priceId) return NextResponse.json({ error: `MISSING_PRICE_ID:${plan.stripeEnv}` }, { status: 500 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const userSnap = await adminDb.doc(`users/${session.uid}`).get();
    const userData = userSnap.data() || {};
    let companyId = typeof body?.companyId === "string" ? body.companyId : "";
    if (plan.kind === "business_subscription" || plan.kind === "addon") {
      if (!companyId) {
        companyId = String(userData.activeOrganizationId || "");
      }
      if (!companyId) return NextResponse.json({ error: "BUSINESS_WORKSPACE_REQUIRED" }, { status: 400 });
      const [orgSnap, memberSnap] = await Promise.all([
        adminDb.doc(`organizations/${companyId}`).get(),
        adminDb.doc(`organizations/${companyId}/members/${session.uid}`).get(),
      ]);
      const member = memberSnap.data() || {};
      if (!orgSnap.exists || (orgSnap.data()?.ownerId !== session.uid && member.active !== true && member.status !== "active")) {
        return NextResponse.json({ error: "BUSINESS_WORKSPACE_FORBIDDEN" }, { status: 403 });
      }
    }
    if (isSubscriptionPlan(plan) && userData.stripeCustomerId && userData.stripeSubscriptionId) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: String(userData.stripeCustomerId),
        return_url: `${appUrl}/pricing`,
      });
      return NextResponse.json({ url: portal.url, portal: true, reason: "EXISTING_SUBSCRIPTION" });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: isSubscriptionPlan(plan) ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan.id)}`,
      cancel_url: `${appUrl}/pricing?cancelled=1`,
      client_reference_id: session.uid,
      customer_email: body?.email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: plan.kind === "business_subscription" ? "required" : "auto",
      tax_id_collection: plan.kind === "business_subscription" ? { enabled: true } : undefined,
      metadata: {
        userId: session.uid,
        planId: plan.id,
        planKind: plan.kind,
        credits: String(plan.credits || 0),
        companyId,
      },
      subscription_data: isSubscriptionPlan(plan) ? {
        metadata: { userId: session.uid, planId: plan.id, companyId },
      } : undefined,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SERVER_ERROR";
    const status = ["UNAUTHENTICATED", "MISSING_SESSION_HEADERS"].includes(message) ? 401 : ["DEVICE_MISMATCH", "SESSION_INVALID", "SECURITY_PROFILE_NOT_FOUND"].includes(message) ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
