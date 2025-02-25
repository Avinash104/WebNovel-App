import { ExtendedConversation } from "@/lib/utils"
import { create } from "zustand"

interface UseChatStore {
  selectedConversation: ExtendedConversation | null
  senderId?: string
  receiverId?: string

  setSelectedConversation: (selectedConversation: ExtendedConversation) => void
  setSenderId: (senderId: string) => void
  setReceiverId: (senderId: string) => void
}

export const useChatStore = create<UseChatStore>((set) => ({
  selectedConversation: null,
  senderId: "",

  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  setSenderId: (senderId) => set({ senderId }),
  setReceiverId: (receiverId) => set({ receiverId }),
}))
