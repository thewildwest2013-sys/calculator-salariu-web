import Stripe from "stripe";
import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { getPlan } from "@/lib/plans";

function isoFromUnix(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

async function saveSubscription(subscription: Stripe.Subscription, planId?: string | null) {
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;
  if (!userId) return;
  const resolvedPlanId = planId || metadata.planId || "unknown";
  const plan = getPlan(resolvedPlanId);
  const now = new Date().toISOString();
  const data = {
    plan: resolvedPlanId,
    planKind: plan?.kind || "subscription",
    subscriptionStatus: subscription.status,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: String(subscription.customer),
    currentPeriodEnd: isoFromUnix(subscription.items.data[0]?.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    employeeLimit: plan?.employeeLimit || null,
    adminLimit: plan?.adminLimit || null,
    profileLimit: plan?.profileLimit || null,
    aiMessagesLimit: plan?.aiMessages || null,
    entitlementActive: ["active", "trialing"].includes(subscription.status),
    updatedAt: now,
  };
  await adminDb.doc(`users/${userId}`).set(data, { merge: true });
  await adminDb.doc(`users/${userId}/profile/main`).set(data, { merge: true });

  const companyId = metadata.companyId;
  if (companyId) await adminDb.doc(`organizations/${companyId}`).set({ ...data, ownerId: userId }, { merge: true });
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 500 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 400 });

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 }); }

  const eventRef = adminDb.doc(`stripeEvents/${event.id}`);
  if ((await eventRef.get()).exists) return NextResponse.json({ received: true, duplicate: true });

  try {
    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const userId = checkout.metadata?.userId || checkout.client_reference_id;
      const planId = checkout.metadata?.planId || "";
      const plan = getPlan(planId);
      if (!userId || !plan) throw new Error("CHECKOUT_METADATA_INVALID");

      await adminDb.runTransaction(async (tx) => {
        const userRef = adminDb.doc(`users/${userId}`);
        const paymentRef = adminDb.doc(`users/${userId}/payments/${checkout.id}`);
        const existing = await tx.get(paymentRef);
        if (existing.exists) return;
        const now = new Date().toISOString();
        const patch: Record<string, unknown> = {
          stripeCustomerId: String(checkout.customer || ""),
          lastPurchasePlan: planId,
          updatedAt: now,
        };
        if (plan.kind === "credit_pack") patch.credits = FieldValue.increment(plan.credits || 0);
        tx.set(userRef, patch, { merge: true });
        tx.set(paymentRef, {
          planId,
          amountTotal: checkout.amount_total,
          currency: checkout.currency,
          mode: checkout.mode,
          credits: plan.credits || 0,
          stripeCustomerId: checkout.customer || null,
          stripeSubscriptionId: checkout.subscription || null,
          processedAt: now,
        });
        tx.set(adminDb.doc(`users/${userId}/creditTransactions/${checkout.id}`), {
          type: plan.kind === "credit_pack" ? "purchase" : "subscription",
          amount: plan.credits || 0,
          planId,
          createdAt: now,
        });
      });

      if (checkout.subscription) {
        const subscription = await stripe.subscriptions.retrieve(String(checkout.subscription));
        await saveSubscription(subscription, planId);
      }
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await saveSubscription(event.data.object as Stripe.Subscription);
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.parent?.subscription_details?.subscription;
      if (subscriptionId && typeof subscriptionId === "string") {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await saveSubscription(subscription);
      }
    }

    await eventRef.set({ type: event.type, processedAt: new Date().toISOString() });
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("STRIPE_WEBHOOK_PROCESSING_ERROR", event.id, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "PROCESSING_FAILED" }, { status: 500 });
  }
}
