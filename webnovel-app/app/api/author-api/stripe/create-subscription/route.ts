import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    console.log("inside create sub api")
    const { userId, storyId, selectedLevel, isAutoRenewOn } = await req.json()

    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    //If the userId from frontend doesnt match with current user, throw an error
    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Fetch user profile
    const customer = await prismadb.profile.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })
    if (!customer) {
      return new NextResponse("User profile not found", { status: 404 })
    }

    // Fetch membership level
    const membershipLevel = await prismadb.membershipLevel.findUnique({
      where: { id: selectedLevel },
    })
    if (!membershipLevel) {
      return new NextResponse("Membership level not found", { status: 404 })
    }

    // Check if user has a Stripe customer ID, if not create one
    let customerId = customer.customerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      })
      customerId = customer.id
      await prismadb.profile.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    //Fetch the story title for teh session
    const story = await prismadb.story.findUnique({
      where: { id: storyId },
      select: { title: true },
    })

    if (!story) {
      return new NextResponse("Story not found", { status: 404 })
    }

    // Create a new Stripe Price dynamically
    const price = await stripe.prices.create({
      unit_amount: membershipLevel.price * 100, // Convert to cents
      currency: "usd",
      recurring: isAutoRenewOn ? { interval: "month" } : undefined,
      product_data: {
        name: `${membershipLevel.title} tier for ${story.title}`,
      },
    })

    //Create an order
    const order = await prismadb.order.create({
      data: {
        userId,
        storyTitle: story.title,
        totalAmount: price.unit_amount,
      },
    })

    // Create a stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isAutoRenewOn ? "subscription" : "payment",
      billing_address_collection: "required",
      customer: customerId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
          adjustable_quantity: { enabled: false }, // Ensures only 1 subscription per purchase
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/stories/${storyId}/subscription-success?session_id={CHECKOUT_SESSION_ID}`, //CHECKOUT_SESSION_ID is the placeholder which will be filled by stripe
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/stories/${storyId}/subscription-cancelled`,
      metadata: {
        userId,
        storyId,
        orderId: order.id,
        selectedLevel,
        isAutoRenewOn: isAutoRenewOn.toString(),
      },
    })

    return NextResponse.json({ sessionUrl: session.url, orderId: order.id })
  } catch (error) {
    console.error("Stripe subscription error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
