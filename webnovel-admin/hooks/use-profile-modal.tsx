import { create } from "zustand"

interface useProfileModal {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useProfileModal = create<useProfileModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
