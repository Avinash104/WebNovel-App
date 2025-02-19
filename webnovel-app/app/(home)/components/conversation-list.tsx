"use client"

import { useChatStore } from "@/hooks/use-chat-store"
import { ExtendedConversation } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { Profile } from "@prisma/client"
import { useEffect } from "react"

interface ConversationListProps {
  conversations: ExtendedConversation[]
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
}) => {
  const { user } = useUser()
  const {
    selectedConversation,
    setSelectedConversation,
    setSenderId,
    setReceiverId,
  } = useChatStore()

  // Select the top most conversation
  useEffect(() => {
    setSelectedConversation(conversations[0])
    setSenderId(user?.id || "")
    setReceiverId(
      conversations[0].participants.find((p: Profile) => p.id !== user?.id)
        ?.id || ""
    )
  }, [setSelectedConversation, conversations, setSenderId, user, setReceiverId])

  const onConversationSelection = (conversation: ExtendedConversation) => {
    setSelectedConversation(conversation)
    setReceiverId(
      conversation.participants.find((p: Profile) => p.id !== user?.id)?.id ||
        ""
    )
  }

  return (
    <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Conversations</h2>
      <ul>
        {conversations?.map((conversation: ExtendedConversation) => (
          <li
            key={conversation.id}
            className={`p-2 cursor-pointer rounded-md ${
              selectedConversation?.id === conversation.id
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onConversationSelection(conversation)}
          >
            {
              conversation.participants.find((p: Profile) => p.id !== user?.id)
                ?.username
            }
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ConversationList
