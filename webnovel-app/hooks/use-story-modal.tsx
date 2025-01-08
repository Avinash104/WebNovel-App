import { create } from "zustand"

interface useStoryModal {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useStoryModal = create<useStoryModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
