import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Webhook Error" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    let userId =
      session.metadata?.userId ||
      session.client_reference_id ||
      null;

    const email = session.customer_email || null;
    const now = new Date().toISOString();

    try {
      // 🔎 fallback pe email
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
        console.error("No userId found:", session.id);
        return NextResponse.json(
          { error: "No userId" },
          { status: 400 }
        );
      }

      const paymentRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("payments")
        .doc(session.id);

      const existing = await paymentRef.get();
      if (existing.exists) {
        return NextResponse.json({ ok: true });
      }

      // 🔥 UPDATE USER
      await adminDb.doc(`users/${userId}`).set(
        {
          isPremium: true,
          plan: "premium_monthly",
          premiumSince: now,
          premiumSource: "stripe",
          updatedAt: now,
        },
        { merge: true }
      );

      // 🔥 UPDATE PROFILE
      await adminDb.doc(`users/${userId}/profile/main`).set(
        {
          isPremium: true,
          plan: "premium_monthly",
          updatedAt: now,
        },
        { merge: true }
      );

      // 🔥 MARCHEZI SESSION
      await paymentRef.set({
        processedAt: now,
      });

      console.log("Premium activat pentru:", userId);
    } catch (err) {
      console.error("Webhook processing error:", err);
      return NextResponse.json(
        { error: "Processing failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}