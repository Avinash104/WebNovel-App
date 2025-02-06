import ReviewSection from "@/app/(home)/stories/component/review-section"
import prismadb from "@/lib/prismadb"
import { pageType } from "@/lib/utils"
import React from "react"

const ReviewsPage = async ({ params }: { params: { profileId: string } }) => {
  const { profileId } = params
  const reviews = await prismadb.review.findMany({
    where: {
      userId: profileId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return (
    <div className="w-full mt-4">
      {reviews && (
        <ReviewSection initialReviews={reviews} page={pageType.PROFILE} />
      )}{" "}
    </div>
  )
}

export default ReviewsPage
