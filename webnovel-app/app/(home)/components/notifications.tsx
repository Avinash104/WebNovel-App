"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatStore } from "@/hooks/use-chat-store"
import { Participant } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { Notification, NotificationType } from "@prisma/client"
import axios from "axios"
import { BellIcon } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"
import { toast } from "react-hot-toast"

interface NotificationsProps {
  notificationFeed: Notification[]
}

const Notifications: React.FC<NotificationsProps> = ({ notificationFeed }) => {
  const { user } = useUser()
  const { setSelectedConversation, setSenderId, setReceiverId } = useChatStore()

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Fetch conversation from conversationId
  const fetchConversation = async (conversationId: string) => {
    if (loading) return

    try {
      setLoading(true)
      const response = await axios.get(
        `/api/author-api/conversation/${conversationId}`
      )
      const conversation = response.data
      console.log("data: ", response.data)
      setSelectedConversation(conversation)
      setSenderId(user?.id || "")
      setReceiverId(
        conversation.participants.find((p: Participant) => p.id !== user?.id)
          ?.id || ""
      )
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

  const setNotificationType = (
    notificationType: NotificationType,
    originId: string
  ) => {
    switch (notificationType) {
      case NotificationType.MESSAGE:
        return `/profile/${user?.id}/messages/${originId}`
      case NotificationType.PROFILE_WALL:
        return `/profile/${user?.id}/wall/${originId}`
      case NotificationType.STORY:
        return `/profile/${user?.id}/stories/${originId}`
      case NotificationType.CHAPTER:
        return `/profile/${user?.id}/chapters/${originId}`
      case NotificationType.STORE_ITEM:
        return `/profile/${user?.id}/store/${originId}`
      default:
        return "/" // Fallback URL
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-8 w-8" />
          <span className="absolute -bottom-1 -right-3 bg-red-500 rounded-full px-1.5 opacity-80">
            {notificationFeed.length > 0 && notificationFeed.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      {notificationFeed.length > 0 && (
        <DropdownMenuContent align="center">
          {notificationFeed.map((notification) => {
            const dynamicHref = setNotificationType(
              notification.notificationType,
              notification.originId
            )

            return (
              <DropdownMenuItem
                key={notification.id}
                disabled={loading}
                onClick={() => {
                  setOpen(false)
                  if (
                    notification.notificationType === NotificationType.MESSAGE
                  ) {
                    fetchConversation(notification.originId) // Fetch data only for messages
                  }
                }}
              >
                <Link href={dynamicHref} className="cursor-pointer text-xl">
                  <span className="underline">{notification.sender}</span>{" "}
                  posted{" "}
                  <span className="text-cyan-400">{notification.content}</span>
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

export default Notifications
