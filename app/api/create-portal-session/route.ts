import Stripe from "stripe";
import { NextResponse } from "next/server";
import { requireValidWebSession } from "@/lib/server-auth-guard";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const authSession = await requireValidWebSession(req);
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 500 });
    const user = await adminDb.doc(`users/${authSession.uid}`).get();
    const customerId = user.data()?.stripeCustomerId;
    if (!customerId) return NextResponse.json({ error: "NO_STRIPE_CUSTOMER" }, { status: 404 });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing` });
    return NextResponse.json({ url: portal.url });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "SERVER_ERROR" }, { status: 500 });
  }
}
