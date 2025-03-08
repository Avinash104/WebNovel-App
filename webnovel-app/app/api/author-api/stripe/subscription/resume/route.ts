import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    console.log("Inside resume subscription API")

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

    console.log("cust profile: ", customer)
    if (!customer || !customer.stripeCustomerId) {
      return new NextResponse("Stripe customer not found", { status: 404 })
    }

    // Fetch paused subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripeCustomerId,
    })

    console.log("paused subscriptions", subscriptions)
    const subscription = subscriptions.data.find(
      (sub) => sub.metadata?.storyId === storyId
    )

    console.log("fetched exact sub to resume", subscription)
    if (!subscription) {
      return new NextResponse("No paused subscription found", { status: 404 })
    }

    // Resume the subscription
    await stripe.subscriptions.update(subscription.id, {
      pause_collection: null, // Clears pause and resumes billing
    })

    await prismadb.membership.update({
      where: { id: membershipId },
      data: { isActive: true },
    })

    console.log("✅ Subscription resumed successfully")

    return NextResponse.json({ message: "Subscription resumed" })
  } catch (error) {
    console.error("STRIPE_RESUME_SUBSCRIPTION_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
