import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const stripe = new Stripe(stripeSecretKey);

async function findUserIdByCustomerId(customerId: string): Promise<string | null> {
  const userSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (!userSnap.empty) {
    return userSnap.docs[0].id;
  }

  const profileSnap = await adminDb
    .collectionGroup("profile")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (!profileSnap.empty) {
    return profileSnap.docs[0].ref.parent.parent?.id ?? null;
  }

  return null;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const profiles = await adminDb
    .collectionGroup("profile")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!profiles.empty) {
    return profiles.docs[0].ref.parent.parent?.id ?? null;
  }

  const users = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!users.empty) {
    return users.docs[0].id;
  }

  return null;
}

async function setPremiumForUser(params: {
  userId: string;
  email?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  plan?: string | null;
}) {
  const now = new Date().toISOString();

  const userData = {
    isPremium: true,
    email: params.email ?? null,
    plan: params.plan ?? "premium_monthly",
    stripeCustomerId: params.stripeCustomerId ?? null,
    stripeSubscriptionId: params.stripeSubscriptionId ?? null,
    subscriptionStatus: params.subscriptionStatus ?? "active",
    premiumUpdatedAt: now,
    premiumSource: "stripe",
  };

  const profileData = {
    ...userData,
    premiumSince: now,
  };

  await adminDb.collection("users").doc(params.userId).set(userData, { merge: true });

  await adminDb
    .collection("users")
    .doc(params.userId)
    .collection("profile")
    .doc("main")
    .set(profileData, { merge: true });
}

async function removePremiumForUser(params: {
  userId: string;
  email?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
}) {
  const now = new Date().toISOString();

  const userData = {
    isPremium: false,
    email: params.email ?? null,
    plan: null,
    stripeCustomerId: params.stripeCustomerId ?? null,
    stripeSubscriptionId: params.stripeSubscriptionId ?? null,
    subscriptionStatus: params.subscriptionStatus ?? "canceled",
    premiumUpdatedAt: now,
    premiumSource: "stripe",
  };

  await adminDb.collection("users").doc(params.userId).set(userData, { merge: true });

  await adminDb
    .collection("users")
    .doc(params.userId)
    .collection("profile")
    .doc("main")
    .set(userData, { merge: true });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("Webhook signature error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      let userId = session.metadata?.userId || session.client_reference_id || null;
      const email = session.customer_email || null;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id || null;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || null;

      if (!userId && email) {
        userId = await findUserIdByEmail(email);
      }

      if (!userId && customerId) {
        userId = await findUserIdByCustomerId(customerId);
      }

      if (!userId) {
        console.error("No userId found for checkout session:", session.id, "email:", email);
        return NextResponse.json({ error: "No userId" }, { status: 400 });
      }

      const paymentRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("payments")
        .doc(session.id);

      const existing = await paymentRef.get();
      if (existing.exists) {
        return NextResponse.json({ ok: true, alreadyProcessed: true }, { status: 200 });
      }

      await setPremiumForUser({
        userId,
        email,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        plan: "premium_monthly",
      });

      await paymentRef.set(
        {
          processedAt: new Date().toISOString(),
          sessionId: session.id,
          email,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          source: "stripe_webhook",
          type: event.type,
        },
        { merge: true }
      );
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      const subscriptionId =
        typeof invoice.subscription === "string" ? invoice.subscription : null;

      if (!customerId) {
        return NextResponse.json({ ok: true, skipped: "No customerId" }, { status: 200 });
      }

      const userId = await findUserIdByCustomerId(customerId);

      if (!userId) {
        console.error("No user found for invoice.paid customer:", customerId);
        return NextResponse.json({ error: "No user for customerId" }, { status: 400 });
      }

      await setPremiumForUser({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        plan: "premium_monthly",
      });
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      const subscriptionId =
        typeof invoice.subscription === "string" ? invoice.subscription : null;

      if (!customerId) {
        return NextResponse.json({ ok: true, skipped: "No customerId" }, { status: 200 });
      }

      const userId = await findUserIdByCustomerId(customerId);

      if (!userId) {
        console.error("No user found for invoice.payment_failed customer:", customerId);
        return NextResponse.json({ error: "No user for customerId" }, { status: 400 });
      }

      await removePremiumForUser({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "past_due",
      });
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;
      const subscriptionId = subscription.id;
      const status = subscription.status;

      if (!customerId) {
        return NextResponse.json({ ok: true, skipped: "No customerId" }, { status: 200 });
      }

      const userId = await findUserIdByCustomerId(customerId);

      if (!userId) {
        console.error("No user found for subscription.updated customer:", customerId);
        return NextResponse.json({ error: "No user for customerId" }, { status: 400 });
      }

      if (status === "active" || status === "trialing") {
        await setPremiumForUser({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: status,
          plan: "premium_monthly",
        });
      } else {
        await removePremiumForUser({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: status,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;
      const subscriptionId = subscription.id;

      if (!customerId) {
        return NextResponse.json({ ok: true, skipped: "No customerId" }, { status: 200 });
      }

      const userId = await findUserIdByCustomerId(customerId);

      if (!userId) {
        console.error("No user found for subscription.deleted customer:", customerId);
        return NextResponse.json({ error: "No user for customerId" }, { status: 400 });
      }

      await removePremiumForUser({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "canceled",
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to process Stripe webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}