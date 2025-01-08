"use client"

import { useProfileModal } from "@/hooks/use-profile-modal"
import { useEffect } from "react"

const SetupPage = () => {
  const onOpen = useProfileModal((state) => state.onOpen)
  const isOpen = useProfileModal((state) => state.isOpen)

  useEffect(() => {
    if (!isOpen) {
      onOpen()
    }
  }, [isOpen, onOpen])

  return null
}

export default SetupPage
