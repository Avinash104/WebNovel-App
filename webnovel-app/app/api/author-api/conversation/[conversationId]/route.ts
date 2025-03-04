import prismadb from "@/lib/prismadb"
import { ExtendedConversation, Participant } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { Conversation } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await currentUser()
    const conversationId = params?.conversationId

    console.log("data: ", conversationId)
    // Block if user trying to send message to themselves
    if (!user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 400 })
    }

    // Fetch active conversations with unread messages count
    const conversation = await prismadb.conversation.findMany({
      where: { id: conversationId },
      include: {
        participants: true,
        unreadCounts: {
          where: { userId: user?.id }, // Fetch only the unread count for the logged-in user
          select: { unreadCount: true },
        },
      },
    })

    console.log("conv: ", conversation)
    // Ensure `unreadMessages` is properly set
    interface UnreadCount {
      unreadCount: number
    }

    interface ConversationWithUnread extends Conversation {
      participants: Participant[]
      unreadCounts: UnreadCount[]
    }

    const extendedConversation: ExtendedConversation[] = conversation.map(
      (conv: ConversationWithUnread) => ({
        ...conv,
        unreadMessages: conv.unreadCounts?.[0]?.unreadCount || 0,
      })
    )

    console.log("extended conversation: ", extendedConversation)

    return NextResponse.json(extendedConversation[0])
  } catch (error) {
    console.error("CONVERSATION_GET_ERROR", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
