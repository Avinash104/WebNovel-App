"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { Button } from "@/components/ui/button"
import { useReviewModal } from "@/hooks/use-review-modal"
import { useUser } from "@clerk/nextjs"
import { Comment } from "@prisma/client"
import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import ReviewBlock from "./review-block"

type Review = {
  id: string
  poster: string
  summary: string
  content: string
  likes: number
  userId: string
  createdAt: Date
  comments: Comment[]
}
interface ReviewSectionProps {
  initialReviews: Review[]
  userHasHundredComments: boolean
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  initialReviews,
  userHasHundredComments,
}) => {
  const { user } = useUser()
  const reviewModal = useReviewModal()

  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isOlderThanMonth, setIsOlderThanMonth] = useState<boolean>(false)

  useEffect(() => {
    console.log("user has 100 comments:", userHasHundredComments)
  }, [userHasHundredComments])

  const setReviewModalOpen = () => {
    if (!user) {
      return toast.error("You need to be logged in to post a review.")
    }

    setLoading(true)

    // Check if user profile is older than a month
    if (user?.createdAt) {
      const userCreatedDate = new Date(user.createdAt)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      setIsOlderThanMonth(userCreatedDate < oneMonthAgo)
    }

    if (isOlderThanMonth || userHasHundredComments) {
      reviewModal.onOpen()
    } else {
      return setAlertModalOpen(true)
    }

    setLoading(false)
  }

  return (
    <>
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onConfirm={() => setAlertModalOpen(false)}
        loading={loading}
        title="Review Not Allowed"
        description="Your account should be older than a month or you should have posted atleast 100 comments in order to review this work."
        noButtons={true}
      />
      <div className="flex items-center justify-between px-6 mb-3">
        <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Reviews
        </h3>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button size="lg" onClick={setReviewModalOpen} className="text-base">
            Post your own review
          </Button>
        </div>
      </div>
      <div className=" px-6 mb-3">
        {reviews?.length > 0 ? (
          reviews.map((review: Review) => (
            <div key={review.id}>
              <ReviewBlock
                reviewId={review.id}
                userId={review.userId}
                poster={review.poster}
                summary={review.summary}
                content={review.content}
                likes={review.likes}
                createdAt={review.createdAt}
              />
            </div>
          ))
        ) : (
          <div>
            No reviews available for this work. Be the first to review it!
          </div>
        )}
      </div>
    </>
  )
}

export default ReviewSection
