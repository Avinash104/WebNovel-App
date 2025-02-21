import { ChatWindow } from "@/app/(home)/components/chat-window"
import ConversationList from "@/app/(home)/components/conversation-list"
import prismadb from "@/lib/prismadb"
// import { PAGE_SIZE } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const MessagesPage = async () => {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/login")
  }

  // Fetch active conversations
  const conversations = await prismadb.conversation.findMany({
    where: {
      participants: {
        some: { id: user?.id },
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: true,
    },
  })

  return (
    <div className="flex w-full">
      {/* Sidebar for active conversations */}
      <ConversationList conversations={conversations} />

      {/* Chat Window for selected conversation */}
      <ChatWindow />
    </div>
  )
}

export default MessagesPage
