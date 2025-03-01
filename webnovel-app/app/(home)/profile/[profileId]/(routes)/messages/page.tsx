import { ChatWindow } from "@/app/(home)/components/chat-window"
import ConversationList from "@/app/(home)/components/conversation-list"
import prismadb from "@/lib/prismadb"
import { ExtendedConversation, Participant } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { Conversation } from "@prisma/client"
import { redirect } from "next/navigation"

const MessagesPage = async () => {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/login")
  }

  // Fetch active conversations with unread messages count
  const conversations = await prismadb.conversation.findMany({
    where: { participants: { some: { id: user?.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: true,
      unreadCounts: {
        where: { userId: user?.id }, // Fetch only the unread count for the logged-in user
        select: { unreadCount: true },
      },
    },
  })

  // Ensure `unreadMessages` is properly set
  interface UnreadCount {
    unreadCount: number
  }

  interface ConversationWithUnread extends Conversation {
    participants: Participant[]
    unreadCounts: UnreadCount[]
  }

  const extendedConversations: ExtendedConversation[] = conversations.map(
    (conv: ConversationWithUnread) => ({
      ...conv,
      unreadMessages: conv.unreadCounts?.[0]?.unreadCount || 0,
    })
  )

  return (
    <div className="flex w-full">
      {/* Sidebar for active conversations */}
      <ConversationList extendedConversations={extendedConversations} />

      {/* Chat Window for selected conversation */}
      <ChatWindow />
    </div>
  )
}

export default MessagesPage
