"use client"

import { Button } from "@/components/ui/button"
import { useChatStore } from "@/hooks/use-chat-store"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export const ChatWindow = () => {
  const { selectedConversation, senderId, receiverId } = useChatStore()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log(" selected conv: ", selectedConversation)
    console.log("sender id & reeciever Id: ", senderId, receiverId)
  }, [selectedConversation, senderId, receiverId])

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    // Logic to send message via API
    try {
      setLoading(true)
      const payload = { message, senderId, receiverId }
      await axios.post(`/api/author-api/messages`, payload)
      console.log("Payload :", payload)
      toast.success("Message sent.")
      setMessage("")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-2/3 p-4 flex flex-col">
      {selectedConversation ? (
        <>
          <div className="flex-1 overflow-y-auto border-b border-gray-300 p-4">
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 ${
                  msg.senderId === senderId ? "text-right" : "text-left"
                }`}
              >
                <span className="px-3 py-2 bg-gray-200 rounded-md inline-block">
                  {msg.content}
                </span>
              </div>
            ))}
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
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Send
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          Select a conversation to start chatting
        </p>
      )}
    </div>
  )
}
