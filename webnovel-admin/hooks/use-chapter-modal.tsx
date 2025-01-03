import { create } from "zustand"

interface useChapterModal {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useChapterModal = create<useChapterModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
