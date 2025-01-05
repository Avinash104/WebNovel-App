"use client"

import { ChapterModal } from "@/components/modals/chapter-modal"
import { ProfileModal } from "@/components/modals/profile-modal"
import { StoreModal } from "@/components/modals/store-modal"
import { StoryModal } from "@/components/modals/story-modal"
import { useEffect, useState } from "react"

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <StoreModal />
      <ProfileModal />
      <StoryModal />
      <ChapterModal />
    </>
  )
}
