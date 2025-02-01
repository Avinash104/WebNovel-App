"use client"

import { useStoryModal } from "@/hooks/use-story-modal"
import { useEffect } from "react"

const StorySetupPage = () => {
  const onOpen = useStoryModal((state) => state.onOpen)
  const isOpen = useStoryModal((state) => state.isOpen)

  useEffect(() => {
    if (!isOpen) {
      onOpen()
    }
  }, [isOpen, onOpen])

  return null
}

export default StorySetupPage
