"use client"

import { Button } from "@/components/ui/button"
import { useMessageModal } from "@/hooks/use-message-modal"
import { useUser } from "@clerk/nextjs"
import { MessageSquare } from "lucide-react"
import React from "react"
import { toast } from "react-hot-toast"

interface MessageSectionProps {
  receiverId: string
}

const MessageSection: React.FC<MessageSectionProps> = ({ receiverId }) => {
  const { user } = useUser()
  const messageModal = useMessageModal()

  const handleMessage = () => {
    if (!user) {
      toast.error("You need to be logged in to send a message.")
      return
    }

    if (receiverId === user?.id) {
      toast.error("Can't send message to yourself.")
      return
    }

    messageModal.setReceiverId(receiverId)
    messageModal.onOpen()
  }

  return (
    <Button onClick={handleMessage}>
      <MessageSquare className="w-8 h-8" />
    </Button>
  )
}

export default MessageSection
