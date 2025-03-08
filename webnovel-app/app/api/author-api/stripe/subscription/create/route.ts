import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { OrderType } from "@prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    console.log("inside create sub api")
    const { userId, storyId, selectedLevel, isAutoRenewOn } = await req.json()

    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // If the userId from frontend doesnt match with current user, throw an error
    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    console.log("user mail :", user?.emailAddresses[0]?.emailAddress)

    // Fetch user profile
    const customer = await prismadb.profile.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    console.log("customer: ", customer)
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
    let customerId = customer.stripeCustomerId

    console.log("cust id: ", customerId)
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      })
      customerId = customer.id
      console.log(
        "created a new stripe cutomer and new cust id is :",
        customerId
      )
      await prismadb.profile.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    //Fetch the story title for the session
    const story = await prismadb.story.findUnique({
      where: { id: storyId },
      select: { title: true, userId: true },
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

    // Create an order
    const order = await prismadb.order.create({
      data: {
        userMail: user?.emailAddresses[0]?.emailAddress,
        orderType: OrderType.SUBSCRIPTION,
        userId,
        authorId: story.userId,
        storyId,
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
      subscription_data: {
        // Metadata helps us reference this exact membership to update/cancel it
        metadata: {
          userId,
          storyId,
          orderId: order.id,
          selectedLevel,
          isAutoRenewOn: isAutoRenewOn.toString(),
        },
      },
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
    console.error("STRIPE_SUBSCRIPTION_POST_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
