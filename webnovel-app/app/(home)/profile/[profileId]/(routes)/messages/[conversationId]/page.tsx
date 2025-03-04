import { ChatWindow } from "@/app/(home)/components/chat-window"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const MessagesPage = async () => {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/login")
  }

  return (
    <div className="w-full">
      {/* Chat Window for selected conversation */}
      <ChatWindow />
    </div>
  )
}

export default MessagesPage
