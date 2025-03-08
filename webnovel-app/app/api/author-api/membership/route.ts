import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    console.log("Inside membership API")
    const { sessionId } = body

    if (!sessionId) {
      return new NextResponse("Session ID is required", { status: 400 })
    }
    console.log("Session ID: ", sessionId)

    // Fetch session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== "paid") {
      return new NextResponse("Payment not completed", { status: 400 })
    }

    // Extract user and story details
    const userId = session.metadata?.userId
    const storyId = session.metadata?.storyId
    const orderId = session.metadata?.orderId
    const selectedLevel = session.metadata?.selectedLevel
    const isAutoRenewOn = session.metadata?.isAutoRenewOn === "true"

    if (!userId || !storyId || !selectedLevel || !orderId) {
      return new NextResponse("Invalid session data", { status: 400 })
    }
    console.log("Metadata from session : ", session.metadata)

    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const validMembershipLevel = await prismadb.membershipLevel.findUnique({
      where: { id: selectedLevel },
    })
    if (!validMembershipLevel) {
      return new NextResponse("Invalid membership level ID", { status: 400 })
    }

    //Commented out the membership expiration calculation function

    // const getExpirationDate = (period: string): Date => {
    //   const now = new Date()
    //   switch (period) {
    //     case "MONTHLY":
    //       now.setMonth(now.getMonth() + 1)
    //       break
    //     case "QUARTERLY":
    //       now.setMonth(now.getMonth() + 3)
    //       break
    //     case "HALFYEARLY":
    //       now.setMonth(now.getMonth() + 6)
    //       break
    //     default:
    //       throw new Error(`Invalid membership period: ${period}`)
    //   }
    //   return now
    // }

    // const expiresAt = getExpirationDate(period)

    const address = session?.customer_details?.address

    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ]

    const addressString = addressComponents.filter((c) => c !== null).join(", ")

    const expiresAt = isAutoRenewOn
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

    if (existingMembership) {
      console.log("⚠️ Membership already exists. Ignoring duplicate payment.")
      return new NextResponse("Membership already exists", { status: 200 })
    }

    // create if membership doesnt exists
    let membership

    if (!existingMembership) {
      try {
        membership = await prismadb.membership.create({
          data: {
            user: { connect: { id: userId } },
            story: { connect: { id: storyId } },
            membershipLevel: { connect: { id: selectedLevel } },
            autoRenew: isAutoRenewOn,
            expiresAt,
          },
        })
      } catch (error) {
        if (error.code === "P2002") {
          console.log(
            "Duplicate membership detected, skipping create membership."
          )
        } else {
          throw error
        }
      }
    }

    // update the order with customer details and isPaid as true
    const updatedOrder = await prismadb.order.update({
      where: { id: orderId },
      data: {
        address: addressString,
        membershipId: membership.id,
        isPaid: true,
      },
    })

    console.log("Updated order", updatedOrder)

    return NextResponse.json(membership, { status: 200 })
  } catch (error) {
    console.error("[MEMBERSHIP_POST_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  const storyId = req.nextUrl.searchParams.get("storyId")

  console.log("data: ", userId, storyId)
  if (!userId || !storyId) {
    return new NextResponse("Missing user or story ID", { status: 400 })
  }

  const existingMembership = await prismadb.membership.findUnique({
    where: { userId_storyId: { userId, storyId } },
  })

  if (existingMembership) {
    return new NextResponse("Membership already exists", {
      status: 202,
    })
  }

  return new NextResponse("OK", { status: 200 })
}
