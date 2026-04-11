import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Lipsește STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!priceId) {
      return NextResponse.json({ error: "Lipsește STRIPE_PRICE_ID" }, { status: 500 });
    }

    if (!appUrl) {
      return NextResponse.json({ error: "Lipsește NEXT_PUBLIC_APP_URL" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const requestBody = (await req.json()) as { uid?: string; email?: string | null };
    const uid = requestBody?.uid;
    const email = requestBody?.email;

    if (!uid) {
      return NextResponse.json({ error: "Lipsește uid-ul utilizatorului" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/premium?canceled=1`,
      client_reference_id: uid,
      customer_email: email || undefined,
      metadata: {
        userId: uid,
        email: email || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
