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
    console.log("Checkpoint 3 for checkout..")
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, storyId, orderId, selectedLevel, isAutoRenewOn } =
      session.metadata!

    const isAutoRenewOnBoolean = isAutoRenewOn === "true"
    const expiresAt = isAutoRenewOnBoolean
      ? null
      : new Date(new Date().setMonth(new Date().getMonth() + 1))

    // Get the Subscription ID (only for subscription mode)
    const subscriptionId = session.subscription as string

    console.log("Checkpoint 4 for checkout..")
    if (!subscriptionId) {
      console.error("❌ No subscription found in session.")
      return new NextResponse("Subscription ID missing", { status: 400 })
    }

    console.log("Checkpoint 5 for checkout..")
    // Retrieve the Subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice.payment_intent"], // Ensure we get the full Invoice object
    })

    // Ensure latest_invoice is an object, not a string
    if (typeof subscription.latest_invoice === "string") {
      console.error("❌ latest_invoice is a string. Expand it properly.")
      return new NextResponse("Error retrieving invoice", { status: 400 })
    }

    // Now safely access payment_intent
    const invoice = subscription.latest_invoice // TypeScript now knows it's an Invoice object
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      console.error("❌ Subscription payment not successful.")
      return new NextResponse("Payment not completed", { status: 400 })
    }

    console.log("✅ Subscription payment successful:", paymentIntent.id)

    // Now create membership only if no existing membership
    const existingMembership = await prismadb.membership.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    })

    console.log("Checkpoint 7 for checkout..")
    if (existingMembership) {
      console.log("⚠️ Membership already exists. Ignoring duplicate payment.")
      return new NextResponse("Membership already exists", { status: 200 })
    }

    console.log("Checkpoint 8 for checkout..")
    // upsert will update the membership if it already exists and create if it doesnt
    let membership
    try {
      membership = await prismadb.membership.upsert({
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
    } catch (error) {
      if (error.code === "P2002") {
        console.log("Duplicate membership detected, skipping upsert.")
      } else {
        throw error
      }
    }

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
    return NextResponse.json(membership)
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
