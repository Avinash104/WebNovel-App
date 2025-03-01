"use client"

import { Button } from "@/components/ui/button"
import { useChatStore } from "@/hooks/use-chat-store"
import { supabase } from "@/lib/supabase"
import { MessageDeliveryStateType, PAGE_SIZE } from "@/lib/utils"
import { Message } from "@prisma/client"
import {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js"
import axios from "axios"
import { Check, CheckCheck } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

export const ChatWindow = () => {
  const { selectedConversation, senderId, receiverId } = useChatStore()
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [isLoadingOldMessages, setIsLoadingOldMessages] =
    useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(0)
  const [messageDeliveryState, setMessageDeliveryState] =
    useState<MessageDeliveryStateType>(MessageDeliveryStateType?.DRAFT)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  // Fetch messages in chunks for infinite scrolling
  const fetchMessages = async () => {
    console.log("fetch message has been triggered")
    console.log("fetch mess loading: ", loading, "has more: ", hasMore)

    if (loading || !hasMore) return

    console.log("fetch message has been triggered 2nd checkpoint")
    try {
      console.log("loading state set to true in fetch try block")
      setLoading(true)
      setIsLoadingOldMessages(true)
      const response = await axios.get(`/api/author-api/messages`, {
        params: { conversationId: selectedConversation?.id, page },
      })

      if (response.data.length < PAGE_SIZE) setHasMore(false)
      const newMessages = response.data.reverse()

      setMessages((prev) => {
        const combined = [...newMessages, ...prev]
        const uniqueMessages = Array.from(
          new Map(combined.map((msg) => [msg.id, msg])).values()
        )
        return uniqueMessages
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error?.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      console.log("loading state set to false in fetch finally block")
      setLoading(false)
    }
  }

  // Trigger message fetch when page changes
  // Seperated fetchMessages from the state updates to ensure proper state updates
  useEffect(() => {
    console.log("use effect loading: ", loading, "has more: ", hasMore)
    if (selectedConversation) {
      setMessages([])
      setPage(0)
      setHasMore(true)
    }
  }, [selectedConversation])

  // Wait for state updates, then fetch messages
  useEffect(() => {
    if (selectedConversation && hasMore) {
      fetchMessages()
    }
  }, [selectedConversation, hasMore])

  // Detect scroll to top for infinite loading
  const handleScroll = () => {
    const chatContainer = chatContainerRef.current
    if (chatContainer && chatContainer.scrollTop === 0 && hasMore && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  // Fetch more messages when page changes
  useEffect(() => {
    if (page > 0) fetchMessages()
  }, [page])

  // Scroll to bottom only on first load or when a new message is sent
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    if (page === 0) {
      // On initial load or when a new message is sent
      setTimeout(() => {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
    } else {
      if (isLoadingOldMessages) {
        // Preserve scroll position when older messages are loaded
        const prevScrollHeight = chatContainer.scrollHeight
        setTimeout(() => {
          const newScrollHeight = chatContainer.scrollHeight
          chatContainer.scrollTop = newScrollHeight - prevScrollHeight
          setIsLoadingOldMessages(false) // Reset after handling
        }, 100)
      } else {
        // Scroll to bottom when a new message is sent
        setTimeout(() => {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth",
          })
        }, 100)
      }
    }
  }, [messages])

  // Handle sending a message
  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    try {
      console.log("loading state set to true in sendMessage funct")
      setLoading(true)
      const payload = { message, senderId, receiverId }
      await axios.post(`/api/author-api/messages`, payload)
      setMessage("")
      setMessageDeliveryState(MessageDeliveryStateType.SENT)

      // Smooth scroll to bottom after sending a message
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error?.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      console.log("loading state set to false in sendMessage funct")
      setLoading(false)
    }
  }

  // Realtiime handling of message inserts and updates
  useEffect(() => {
    if (!selectedConversation) return

    const channel = supabase
      .channel("conversation-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${selectedConversation.id}`,
        },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          const newMessage: Message = payload.new
          setMessages((prev) =>
            prev.some((msg) => msg.id === newMessage.id)
              ? prev
              : [...prev, newMessage]
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${selectedConversation.id}`,
        },
        (payload: RealtimePostgresUpdatePayload<Message>) => {
          const updatedMessage: Message = payload.new
          if (updatedMessage.isRead) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    const lastSentMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.senderId === senderId)

    if (lastSentMessage) {
      if (lastSentMessage.isRead) {
        setMessageDeliveryState(MessageDeliveryStateType.READ)
      } else {
        setMessageDeliveryState(MessageDeliveryStateType.DELIVERED)
      }
    }
  }, [messages, senderId])

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      console.log("loading state set to true in markRead funct")
      setIsMarkingRead(true)
      await axios.patch(`/api/author-api/messages`, { conversationId })
      // await axios
      //   .patch(`/api/author-api/messages`, { conversationId })
      //   .then((res) => toast.success("Mark as read success:", res))
      //   .catch((err) => {
      //     toast.error("Mark as read error:", err)
      //     throw err // Rethrow to trigger finally
      //   })
      setMessageDeliveryState(MessageDeliveryStateType.READ)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error?.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      console.log("loading state set to false in markRead funct")
      setIsMarkingRead(false)
    }
  }

  // Fire markMessagesAsRead whenever messages state is updated
  useEffect(() => {
    if (
      selectedConversation &&
      messages.length > 0 &&
      // Only update if the last message isn't from the user
      messages[messages.length - 1].senderId !== senderId
    ) {
      markMessagesAsRead(selectedConversation.id)
    }
  }, [messages, selectedConversation, senderId])

  return (
    <div className="w-2/3 p-4 h-screen flex flex-col">
      {selectedConversation ? (
        <>
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto border-b border-gray-300 p-4"
          >
            {messages.map((msg: Message, index: number) => {
              const isSender = msg.senderId === senderId
              const isLastSentMessage =
                isSender &&
                index === messages.findLastIndex((m) => m.senderId === senderId)

              return (
                <div
                  key={msg.id}
                  className={`mb-2 ${isSender ? "text-right" : "text-left"}`}
                >
                  <div className="relative inline-block">
                    <span
                      className={`px-3 py-2 rounded-md inline-block ${
                        isSender
                          ? "bg-lime-500 dark:bg-lime-600"
                          : "bg-slate-400"
                      }`}
                    >
                      {msg.content}
                    </span>

                    {/* Show ticks only for the last message sent by the user */}
                    {isLastSentMessage && (
                      <span className="absolute -bottom-5 right-0 flex items-center space-x-1">
                        {messageDeliveryState ===
                        MessageDeliveryStateType.READ ? (
                          <CheckCheck className="w-4 h-4 text-blue-500" />
                        ) : messageDeliveryState ===
                          MessageDeliveryStateType.DELIVERED ? (
                          <CheckCheck className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Check className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {loading && <p className="text-center">Loading more messages...</p>}
          </div>

          <div className="p-2 flex items-center mb-10">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <Button
              onClick={sendMessage}
              disabled={loading || isMarkingRead}
              className="ml-2 bg-blue-500 px-4 py-2 rounded-md"
            >
              Send
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center">Select a conversation to start chatting</p>
      )}
    </div>
  )
}
