import {NextRequest, NextResponse} from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application"
        },
        losses: {
          payments: "application"
        },
      },
    });

    return NextResponse.json({ account });
  } catch (e) {
    console.error("Internal Error:", e);

    return NextResponse.json(
      { error: `An error occurred when calling the Stripe API to create an account: ${e}`},
      { status: 500 }
    )
  }
}
