import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  try {
    console.log("Inside cancel subscription API")

    const { userId, storyId, cancelNow } = await req.json() // cancelNow = true for immediate cancel

    console.log(userId, storyId, cancelNow)
    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Fetch Stripe Customer ID
    const customer = await prismadb.profile.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (!customer || !customer.stripeCustomerId) {
      return new NextResponse("Stripe customer not found.", { status: 404 })
    }

    // Fetch active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripeCustomerId,
      status: "active",
    })

    console.log("Subscriptions fetched: ", subscriptions)

    const subscription = subscriptions.data.find(
      (sub) => sub.metadata?.storyId === storyId
    )

    console.log("Subscription fetched: ", subscription)

    if (!subscription) {
      return new NextResponse("No active subscription found", { status: 404 })
    }

    // Cancel the subscription
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: !cancelNow, // If false, allows user to use it until the period ends
    })

    // If cancel_now is true, cancel immediately
    if (cancelNow) {
      await stripe.subscriptions.cancel(subscription.id)
    }

    // Remove membership from database
    await prismadb.membership.delete({
      where: { userId_storyId: { userId, storyId } },
    })

    console.log("✅ Subscription canceled successfully")

    return NextResponse.json({ message: "Subscription canceled" })
  } catch (error) {
    console.error("STRIPE_CANCEL_SUBSCRIPTION_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
