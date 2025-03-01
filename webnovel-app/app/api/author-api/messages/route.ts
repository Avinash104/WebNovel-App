import prismadb from "@/lib/prismadb"
import { PAGE_SIZE } from "@/lib/utils"
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

    // If no conversation exists, create a new one
    if (!conversation) {
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

    // Update the unread message count for the receiver
    await prismadb.conversationUnreadCount.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId: receiverId,
        },
      },
      update: { unreadCount: { increment: 1 } }, // Increment unread count
      create: {
        conversationId: conversation.id,
        userId: receiverId,
        unreadCount: 1, // Start with 1 if no record exists
      },
    })

    // Find the sender's username
    const profileUsername = await prismadb.profile.findUnique({
      where: { id: senderId },
      select: { username: true },
    })

    // Create a notification in receiver's feed
    await prismadb.notification.create({
      data: {
        content: message,
        sender: profileUsername.username,
        user: { connect: { id: receiverId } },
      },
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("MESSAGE_POST_ERROR", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser()
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")
    const page = Number(searchParams.get("page") ?? 0)

    // Block if user trying to send message to themselves
    if (!user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 400 })
    }

    const messages = await prismadb.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: Number(page) * PAGE_SIZE,
      take: PAGE_SIZE,
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("MESSAGE_GET_ERROR", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const body = await req.json()
    const { conversationId } = body

    if (!conversationId) {
      return new NextResponse("Invalid input data", { status: 400 })
    }

    // Use user id to mark messages as read
    const updatedMessages = await prismadb.message.updateMany({
      where: {
        conversationId,
        receiverId: user.id, // Only mark messages where the authenticated user is the receiver
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    // Reset unread count for this conversation
    await prismadb.conversationUnreadCount.updateMany({
      where: { conversationId, userId: user.id },
      data: { unreadCount: 0 }, // Reset unread count
    })

    return NextResponse.json({ success: true, updated: updatedMessages.count })
  } catch (error) {
    console.error("MESSAGE_PATCH_ERROR", error)
    return NextResponse.json(
      { message: "Failed to update messages" },
      { status: 500 }
    )
  }
}
