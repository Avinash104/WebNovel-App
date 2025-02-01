import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  console.log("Inside the webhook")
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    console.log("Inside the webhook 2")
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const address = session?.customer_details?.address
  const addressString = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ")

  // Handle successful checkout
  const handleSuccessfulCheckout = async (event: Stripe.Event) => {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, storyId, orderId, selectedLevel, isAutoRenewOn } =
      session.metadata!

    const isAutoRenewOnBoolean = isAutoRenewOn === "true"
    const expiresAt = isAutoRenewOnBoolean
      ? null
      : new Date(new Date().setMonth(new Date().getMonth() + 1))

    // upsert will update the membership if it already exists and create if it doesnt
    const membership = await prismadb.membership.upsert({
      where: {
        userId_storyId: { userId, storyId },
      },
      update: {
        membershipLevel: { connect: { id: selectedLevel } },
        autoRenew: isAutoRenewOnBoolean,
        expiresAt,
      },
      create: {
        user: { connect: { id: userId } },
        story: { connect: { id: storyId } },
        membershipLevel: { connect: { id: selectedLevel } },
        autoRenew: isAutoRenewOnBoolean,
        expiresAt,
      },
    })

    // Update the order with cust details and isPaid set to true
    const updatedOrder = await prismadb.order.update({
      where: { id: orderId },
      data: {
        address: addressString,
        membershipId: membership.id,
        isPaid: true,
      },
    })

    console.log("Updated order:", updatedOrder)
    return NextResponse.json(membership, { status: 200 })
  }

  // Handle subscription update (e.g., renewal, plan change)
  const handleSubscriptionUpdate = async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await prismadb.membership.updateMany({
      where: { user: { customerId } },
      data: { expiresAt: new Date(subscription.current_period_end * 1000) },
    })

    console.log(`🔄 Subscription updated for Customer ${customerId}`)
  }

  // Handle subscription cancellation
  const handleSubscriptionCancellation = async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await prismadb.membership.updateMany({
      where: { user: { customerId } },
      data: { expiresAt: new Date() },
    })

    console.log(`❌ Subscription canceled for Customer ${customerId}`)
  }

  // Switch-case to handle different Stripe events
  switch (event.type) {
    case "checkout.session.completed":
      await handleSuccessfulCheckout(event)
      break

    case "customer.subscription.updated":
      // await handleSubscriptionUpdate(event)
      console.log("Inside subscription update event")
      break

    case "customer.subscription.deleted":
      await handleSubscriptionCancellation(event)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
      return new NextResponse(`Unhandled event type: ${event.type}`, {
        status: 200,
      })
  }

  return new NextResponse(null, { status: 200 })
}
