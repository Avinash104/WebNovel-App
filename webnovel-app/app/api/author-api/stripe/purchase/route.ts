import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: body.items.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      success_url: `/success`,
      cancel_url: `/cancel`,
    })

    return NextResponse.json(session.url, { status: 200 })
  } catch (error) {
    console.error("Error creating purchase session:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
