import {NextRequest, NextResponse} from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { account } = await request.json();

    const accountSession = await stripe.accountSessions.create({
      account: account,
      components: {
        account_onboarding: { enabled: true },
      }
    });

    console.log("Account Session:", accountSession);

    return NextResponse.json({ client_secret: accountSession.client_secret });
  } catch (e) {
    console.error("Internal Error:", e);

    return NextResponse.json(
      { error: `An error occurred when calling the Stripe API to create an account session: ${e}`},
      { status: 500 }
    )
  }
}
