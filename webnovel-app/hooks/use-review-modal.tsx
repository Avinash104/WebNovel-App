import { create } from "zustand"

interface UseReviewModal {
  isOpen: boolean
  reviewId?: string
  summary?: string
  content?: string
  onOpen: (reviewId?: string, summary?: string, content?: string) => void
  onClose: () => void
  setReviewId: (reviewId: string) => void
  setSummary: (summary: string) => void
  setContent: (content: string) => void
}

export const useReviewModal = create<UseReviewModal>((set) => ({
  isOpen: false,
  reviewId: "",
  summary: "",
  content: "",

  onOpen: (reviewId = "", summary = "", content = "") =>
    set({ isOpen: true, reviewId, summary, content }),

  onClose: () => set({ isOpen: false, reviewId: "", summary: "", content: "" }),

  setReviewId: (reviewId) => set({ reviewId }),
  setSummary: (summary) => set({ summary }),
  setContent: (content) => set({ content }),
}))
