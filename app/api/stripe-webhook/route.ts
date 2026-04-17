import Stripe from "stripe";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // 🔥 DOAR AICI MODIFICĂM
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    let userId =
      session.metadata?.userId || session.client_reference_id || null;

    const email = session.customer_email || null;

    // 🔥 fallback pe email
    if (!userId && email) {
      const snap = await adminDb
        .collectionGroup("profile")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!snap.empty) {
        const doc = snap.docs[0];
        userId = doc.ref.parent.parent?.id || null;
      }
    }

    if (!userId) {
      console.error("No userId found for session:", session.id);
      return new Response("No userId", { status: 400 });
    }

    const now = new Date().toISOString();

    // 🔐 PROTECȚIE DUPLICATE
    const existing = await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc(session.id)
      .get();

    if (existing.exists) {
      console.log("Webhook deja procesat:", session.id);
      return new Response("Already processed", { status: 200 });
    }

    // 🔥 ACTIVEZI PREMIUM
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

    // 🔥 UPDATE PROFIL (dacă îl folosești în UI)
    await adminDb.doc(`users/${userId}/profile/main`).set(
      {
        isPremium: true,
        plan: "premium_monthly",
        updatedAt: now,
      },
      { merge: true }
    );

    // 🔥 MARCHEZI SESSION CA PROCESAT
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc(session.id)
      .set({
        processedAt: now,
      });

    console.log("Premium activat pentru:", userId);
  }

  return NextResponse.json({ received: true });
}