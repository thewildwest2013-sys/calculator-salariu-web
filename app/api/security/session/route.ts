import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let userId = session.metadata?.userId || session.client_reference_id || null;
    const email = session.customer_email || null;
    const now = new Date().toISOString();

    try {
      if (!userId && email) {
        const profiles = await adminDb
          .collectionGroup("profile")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (!profiles.empty) {
          const profileDoc = profiles.docs[0];
          userId = profileDoc.ref.parent.parent?.id || null;
        }
      }

      if (!userId) {
        console.error("No userId found for session:", session.id, "email:", email);
        return new Response("No userId", { status: 400 });
      }

      const paymentRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("payments")
        .doc(session.id);

      const existing = await paymentRef.get();
      if (existing.exists) {
        return new Response("Already processed", { status: 200 });
      }

      const premiumData = {
        isPremium: true,
        email: email ?? null,
        plan: "premium_monthly",
        stripeCustomerId: session.customer ?? null,
        premiumSince: now,
        premiumUpdatedAt: now,
        premiumSource: "stripe",
      };

      await adminDb
        .collection("users")
        .doc(userId)
        .set(
          {
            isPremium: true,
            email: email ?? null,
            plan: "premium_monthly",
            stripeCustomerId: session.customer ?? null,
            premiumUpdatedAt: now,
            premiumSource: "stripe",
          },
          { merge: true }
        );

      await adminDb
        .collection("users")
        .doc(userId)
        .collection("profile")
        .doc("main")
        .set(premiumData, { merge: true });

      await paymentRef.set(
        {
          processedAt: now,
          sessionId: session.id,
          email: email ?? null,
          stripeCustomerId: session.customer ?? null,
          source: "stripe_webhook",
          type: event.type,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to update user after Stripe webhook:", error);
      return new Response("Failed to update user", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
