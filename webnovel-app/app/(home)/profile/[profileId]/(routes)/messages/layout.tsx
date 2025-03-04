import ConversationList from "@/app/(home)/components/conversation-list"
import prismadb from "@/lib/prismadb"
import { ExtendedConversation, Participant } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { Conversation } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
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
    <>
      {/* Sidebar for active conversations */}
      <ConversationList extendedConversations={extendedConversations} />

      {children}
    </>
  )
}
