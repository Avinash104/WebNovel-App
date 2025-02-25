import { create } from "zustand"

interface useMessageModal {
  isOpen: boolean
  receiverId: string
  setReceiverId: (receiverId: string) => void
  onOpen: () => void
  onClose: () => void
}

export const useMessageModal = create<useMessageModal>((set) => ({
  receiverId: "",

  isOpen: false,
  setReceiverId: (receiverId) => set({ receiverId }),
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
