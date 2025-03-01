"use client"

import { useChatStore } from "@/hooks/use-chat-store"
import { supabase } from "@/lib/supabase"
import { ExtendedConversation, Participant } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { useEffect, useMemo, useState } from "react"

interface ConversationListProps {
  extendedConversations: ExtendedConversation[]
}

const ConversationList: React.FC<ConversationListProps> = ({
  extendedConversations,
}) => {
  const { user } = useUser()
  const {
    selectedConversation,
    setSelectedConversation,
    setSenderId,
    setReceiverId,
  } = useChatStore()

  const [extendedConversationsState, setExtendedConversationsState] = useState(
    extendedConversations
  )

  // Set the sender and receiver ids
  useEffect(() => {
    setSenderId(user?.id || "")
    setReceiverId(
      extendedConversations[0].participants.find(
        (p: Participant) => p.id !== user?.id
      )?.id || ""
    )
  }, [
    setSelectedConversation,
    extendedConversations,
    setSenderId,
    user,
    setReceiverId,
  ])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel("conversation-unread-count")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ConversationUnreadCount",
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          setExtendedConversationsState((prev) =>
            prev.map((conv) =>
              conv.id === payload.new.conversationId
                ? { ...conv, unreadMessages: payload.new.unreadCount }
                : conv
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const onConversationSelection = (conversation: ExtendedConversation) => {
    setSelectedConversation(conversation)
    setReceiverId(
      conversation.participants.find((p: Participant) => p.id !== user?.id)
        ?.id || ""
    )
  }

  const conversationsWithUsernames = useMemo(() => {
    if (!user?.id) return [] // Ensure user is loaded

    return extendedConversationsState?.map((conversation) => ({
      ...conversation,
      otherUsername:
        conversation.participants.find((p: Participant) => p.id !== user.id)
          ?.username || "loading..",
    }))
  }, [extendedConversationsState, user?.id])

  return (
    <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Conversations</h2>
      <ul>
        {conversationsWithUsernames?.map((conversation) => (
          <li
            key={conversation.id}
            className={`p-2 cursor-pointer rounded-md flex items-center justify-between ${
              selectedConversation?.id === conversation.id
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onConversationSelection(conversation)}
          >
            {conversation.otherUsername || "loading..."}{" "}
            {conversation.unreadMessages > 0 && (
              <span className="bg-red-600 rounded-full px-2 text-base">
                {conversation.unreadMessages}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ConversationList
