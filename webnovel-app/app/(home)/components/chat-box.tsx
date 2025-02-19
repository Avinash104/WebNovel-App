"use client"

import { useEffect, useState } from "react"

interface ChatBoxProps {
  conversation: any
  userId: string
}

const ChatBox: React.FC<ChatBoxProps> = ({ conversation, userId }) => {
  const [messages, setMessages] = useState(conversation.messages)
  const [newMessage, setNewMessage] = useState("")

  // Function to send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: newMessage,
        senderId: userId,
        receiverId: conversation.participants.find((p) => p.id !== userId)?.id,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      setMessages([...messages, data.message])
      setNewMessage("")
    }
  }

  // Auto-refresh messages every 5 seconds (replace with WebSockets for real-time updates)
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/conversations/${conversation.id}`)
      if (res.ok) {
        const updatedConversation = await res.json()
        setMessages(updatedConversation.messages)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [conversation.id])

  return (
    <div className="flex flex-col flex-1">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 my-2 rounded-md ${
              msg.senderId === userId
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t p-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-md p-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatBox
