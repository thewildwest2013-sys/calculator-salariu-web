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
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id || null;
    const email = session.customer_email || null;

    try {
      if (userId) {
        const premiumData = {
          isPremium: true,
          plan: "premium_monthly",
          stripeCustomerId: session.customer ?? null,
          premiumSince: new Date().toISOString(),
          premiumUpdatedAt: new Date().toISOString(),
          premiumSource: "stripe",
        };

        await adminDb.collection("users").doc(userId).set(
          {
            isPremium: true,
            email: email ?? null,
            plan: "premium_monthly",
            stripeCustomerId: session.customer ?? null,
            premiumUpdatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        await adminDb.collection("users").doc(userId).collection("profile").doc("main").set(
          {
            email: email ?? null,
            ...premiumData,
          },
          { merge: true }
        );
      } else if (email) {
        const profiles = await adminDb.collectionGroup("profile").where("email", "==", email).get();

        if (!profiles.empty) {
          const profileDoc = profiles.docs[0];
          const userRef = profileDoc.ref.parent.parent;
          const premiumData = {
            isPremium: true,
            email,
            plan: "premium_monthly",
            stripeCustomerId: session.customer ?? null,
            premiumSince: new Date().toISOString(),
            premiumUpdatedAt: new Date().toISOString(),
            premiumSource: "stripe",
          };

          await profileDoc.ref.set(premiumData, { merge: true });
          if (userRef) {
            await userRef.set(
              {
                isPremium: true,
                email,
                plan: "premium_monthly",
                stripeCustomerId: session.customer ?? null,
                premiumUpdatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        }
      }
    } catch {
      return new Response("Failed to update user", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
