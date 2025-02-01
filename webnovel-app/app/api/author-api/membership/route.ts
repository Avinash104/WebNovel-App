import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

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

    // upsert will update the membership if it already exists and create if it doesnt
    const membership = await prismadb.membership.upsert({
      where: {
        userId_storyId: { userId, storyId },
      },
      update: {
        membershipLevel: { connect: { id: selectedLevel } },
        autoRenew: isAutoRenewOn,
        expiresAt,
      },
      create: {
        user: { connect: { id: userId } },
        story: { connect: { id: storyId } },
        membershipLevel: { connect: { id: selectedLevel } },
        autoRenew: isAutoRenewOn,
        expiresAt,
      },
    })

    //update the order with customer details and isPaid as true
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
