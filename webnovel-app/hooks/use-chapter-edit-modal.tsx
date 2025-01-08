import { create } from "zustand"

interface useChapterEditModal {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useChapterEditModal = create<useChapterEditModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
