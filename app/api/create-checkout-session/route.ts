import Stripe from "stripe";
import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";

export async function POST(req: Request) {
  try {
    const session = await requireValidWebSession(req);

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

    const body = await req.json().catch(() => ({}));
    const email = body?.email || null;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/premium?canceled=1`,
      client_reference_id: session.uid,
      customer_email: email || undefined,
      metadata: {
        userId: session.uid,
        email: email || "",
        plan: "premium_monthly",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    const code = String(error?.message || "SERVER_ERROR");

    if (code === "UNAUTHENTICATED" || code === "MISSING_SESSION_HEADERS") {
      return NextResponse.json({ error: code }, { status: 401 });
    }

    if (
      code === "SECURITY_PROFILE_NOT_FOUND" ||
      code === "DEVICE_MISMATCH" ||
      code === "SESSION_INVALID"
    ) {
      return NextResponse.json({ error: code }, { status: 403 });
    }

    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}