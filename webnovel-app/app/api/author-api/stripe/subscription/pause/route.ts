import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    console.log("Inside pause subscription API")

    const body = await req.json()
    const { userId, storyId, membershipId } = body.data

    const user = await currentUser()

    console.log(userId, storyId)

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
      return new NextResponse("Stripe customer not found", { status: 404 })
    }

    // Fetch active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripeCustomerId,
      status: "active",
    })

    const subscription = subscriptions.data.find(
      (sub) => sub.metadata?.storyId === storyId
    )

    if (!subscription) {
      return new NextResponse("No active subscription found", { status: 404 })
    }

    // Pause the subscription
    await stripe.subscriptions.update(subscription.id, {
      pause_collection: { behavior: "keep_as_draft" }, // Keeps it in draft mode
    })

    await prismadb.membership.update({
      where: { id: membershipId },
      data: { isActive: false },
    })

    console.log("✅ Subscription paused successfully")

    return NextResponse.json({ message: "Subscription paused" })
  } catch (error) {
    console.error("STRIPE_PAUSE_SUBSCRIPTION_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
