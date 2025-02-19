import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    const { message, receiverId, senderId } = await req.json()

    // Block if user trying to send message to themselves
    if (!user || user.id === receiverId) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 400 })
    }

    console.log(message, receiverId, senderId)
    if (!message || !receiverId || !senderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if a conversation already exists between the users
    let conversation = await prismadb.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { id: senderId },
            },
          },
          {
            participants: {
              some: { id: receiverId },
            },
          },
        ],
        // Ensure it's only between these two participants
        participants: {
          every: { id: { in: [senderId, receiverId] } },
        },
      },
      include: { participants: true },
    })

    console.log("conv: ", conversation)

    // If no conversation exists, create a new one
    if (!conversation) {
      console.log("Creating a new conv ...")
      conversation = await prismadb.conversation.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: receiverId }],
          },
        },
        include: { participants: true },
      })
    }

    // Create the new message in the conversation
    const newMessage = await prismadb.message.create({
      data: {
        content: message,
        senderId,
        receiverId,
        conversationId: conversation.id,
      },
    })

    return NextResponse.json(
      { success: true, message: newMessage },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
