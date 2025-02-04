import { ReviewModal } from "@/components/modals/review-modal"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <ReviewModal />
      {children}
    </div>
  )
}
