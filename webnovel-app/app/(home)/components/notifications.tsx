"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Notification } from "@prisma/client"
import { BellIcon } from "lucide-react"
import React from "react"

interface NotificationsProps {
  notificationFeed: Notification[]
}

const Notifications: React.FC<NotificationsProps> = ({ notificationFeed }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-8 w-8" />
          <span className="absolute -bottom-1 -right-3 bg-red-500 rounded-full px-1.5 opacity-80">
            {notificationFeed.length > 0 && notificationFeed.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {notificationFeed.map((notification) => (
          <DropdownMenuItem key={notification.id}>
            <div className="cursor-pointer text-xl">
              <span className="underline">{notification.sender}</span> posted{" "}
              <span className="text-cyan-400">{notification.content} </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Notifications
