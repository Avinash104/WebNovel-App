import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    console.log("Inside update subscription API")

    const { userId, storyId, newLevel, isAutoRenewOn } = await req.json()
    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Fetch the existing membership
    const existingMembership = await prismadb.membership.findUnique({
      where: { userId_storyId: { userId, storyId } },
      include: { membershipLevel: true },
    })

    if (!existingMembership) {
      return new NextResponse("Membership not found", { status: 404 })
    }

    // Fetch user profile to get Stripe customer ID
    const customer = await prismadb.profile.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (!customer || !customer.stripeCustomerId) {
      return new NextResponse("Stripe customer not found", { status: 404 })
    }

    // Fetch the new membership level
    const membershipLevel = await prismadb.membershipLevel.findUnique({
      where: { id: newLevel },
    })

    if (!membershipLevel) {
      return new NextResponse("Membership level not found", { status: 404 })
    }

    // Fetch the Stripe Subscription
    const subscription = await stripe.subscriptions.list({
      customer: customer.stripeCustomerId,
      status: "active",
    })

    const existingSubscription = subscription.data.find(
      (sub) => sub.metadata?.storyId === storyId
    )

    if (!existingSubscription) {
      return new NextResponse("No active subscription found", { status: 404 })
    }

    // Update the Stripe Subscription Price
    const newPrice = await stripe.prices.create({
      unit_amount: membershipLevel.price * 100, // Convert to cents
      currency: "usd",
      recurring: isAutoRenewOn ? { interval: "month" } : undefined,
      product_data: {
        name: `${membershipLevel.title} tier for story ${storyId}`,
      },
    })

    // Update the subscription items with the new price
    await stripe.subscriptions.update(existingSubscription.id, {
      cancel_at_period_end: !isAutoRenewOn, // Handles auto-renew toggle
      items: [
        {
          id: existingSubscription.items.data[0].id,
          price: newPrice.id,
        },
      ],
    })

    // Update Membership in Database
    const updatedMembership = await prismadb.membership.update({
      where: { userId_storyId: { userId, storyId } },
      data: {
        membershipLevel: { connect: { id: newLevel } },
        autoRenew: isAutoRenewOn,
      },
    })

    console.log("✅ Subscription updated successfully")

    return NextResponse.json({
      message: "Subscription updated",
      updatedMembership,
    })
  } catch (error) {
    console.error("STRIPE_UPDATE_SUBSCRIPTION_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
