import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { OrderType } from "@prisma/client"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { userId, storeItemId } = await req.json()

    // If the userId from frontend doesnt match with current user, throw an error
    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const storeItem = await prismadb.storeItem.findUnique({
      id: storeItemId,
    })

    // If the store item is not found
    if (!storeItem) {
      return new NextResponse("Store item doesn't exists.", { status: 403 })
    }

    const authorId = await prismadb.store.findUnique({
      where: { id: storeItem.storeId },
      select: { userId: true },
    })

    console.log("store author id: ", authorId)
    // If store item author is not found
    if (!authorId) {
      return new NextResponse("Author doesn't exist for the store item.", {
        status: 403,
      })
    }

    // Create an order
    await prismadb.order.create({
      data: {
        orderType: OrderType.PAYMENT,
        userId,
        authorId,
        storeItemId: storeItem.id,
        storyItemTitle: storeItem.title,
        totalAmount: storeItem.price,
      },
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: body.items.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      success_url: `/success`,
      cancel_url: `/cancel`,
    })

    return NextResponse.json(session.url, { status: 200 })
  } catch (error) {
    console.error("STRIPE_PURCHASE_POST_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
