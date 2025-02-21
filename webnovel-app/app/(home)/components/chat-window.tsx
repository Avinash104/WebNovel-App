"use client"

import { Button } from "@/components/ui/button"
import { useChatStore } from "@/hooks/use-chat-store"
import { PAGE_SIZE } from "@/lib/utils"
import { Message } from "@prisma/client"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

export const ChatWindow = () => {
  const { selectedConversation, senderId, receiverId } = useChatStore()
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(0)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch messages in chunks for infinite scrolling
  const fetchMessages = async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      const response = await axios.get(`/api/author-api/messages`, {
        params: { conversationId: selectedConversation?.id, page },
      })
      console.log("API response:", response.data)

      if (response.data.length < PAGE_SIZE) setHasMore(false)
      const newMessages = response.data.reverse()
      setMessages((prev) => [...newMessages, ...prev])
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error?.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  // Trigger message fetch when page changes
  useEffect(() => {
    if (selectedConversation) {
      setMessages([])
      setPage(0)
      setHasMore(true)
      fetchMessages()
    }
  }, [selectedConversation])

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
      // When loading older messages, maintain the scroll position
      const prevScrollHeight = chatContainer.scrollHeight
      setTimeout(() => {
        const newScrollHeight = chatContainer.scrollHeight
        chatContainer.scrollTop = newScrollHeight - prevScrollHeight
      }, 100)
    }
  }, [messages])

  // Handle sending a message
  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    try {
      setLoading(true)
      const payload = { message, senderId, receiverId }
      const response = await axios.post(`/api/author-api/messages`, payload)
      toast.success("Message sent.")
      setMessages((prev) => [...prev, response.data])
      setMessage("")

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
      setLoading(false)
    }
  }

  return (
    <div className="w-2/3 p-4 h-screen flex flex-col">
      {selectedConversation ? (
        <>
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto border-b border-gray-300 p-4 scrollbar-hide"
          >
            {messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`mb-2 ${
                  msg.senderId === senderId ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`px-3 py-2 rounded-md inline-block ${
                    msg.senderId === senderId
                      ? "bg-lime-500 dark:bg-lime-600"
                      : "bg-slate-400"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
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
              disabled={loading}
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
