import {NextRequest, NextResponse} from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    const loginLink = await stripe.accounts.createLoginLink(accountId);

    console.log("Login Link:", loginLink);

    return NextResponse.json({ url: loginLink.url });
  } catch (e) {
    console.error("Internal Error:", e);

    return NextResponse.json(
      { error: `An error occurred when calling the Stripe API to create an account session: ${e}`},
      { status: 500 }
    )
  }
}
