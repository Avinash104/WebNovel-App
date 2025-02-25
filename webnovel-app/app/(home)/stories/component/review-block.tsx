"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useReviewModal } from "@/hooks/use-review-modal"
import { useUser } from "@clerk/nextjs"
import axios from "axios"
import { LucideThumbsUp, PencilIcon, Trash } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface ReviewBlockProps {
  reviewId: string
  userId: string
  poster: string
  summary: string
  content: string
  likes: number
  createdAt: Date
}

const ReviewBlock: React.FC<ReviewBlockProps> = ({
  reviewId,
  userId,
  poster,
  summary,
  content,
  likes,
  createdAt,
}) => {
  const { user } = useUser()
  const params = useParams()
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [reviewLikes, setReviewLikes] = useState<number>(likes)
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const reviewModal = useReviewModal()

  const handleEditReview = (
    reviewId: string,
    summary: string,
    content: string
  ) => {
    reviewModal.onOpen(reviewId, summary, content)
  }

  const handleReviewLike = async () => {
    if (!user) {
      toast.error("You need to log in to like a review.")
      return
    }

    try {
      setIsLiked(!isLiked)
      if (isLiked) {
        setReviewLikes(reviewLikes - 1)
      } else {
        setReviewLikes(reviewLikes + 1)
      }

      await axios.patch(
        `/api/author-api/stories/${params.storyId}/reviews/${reviewId}`,
        isLiked
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong.", error.response?.data?.message)
      } else {
        toast.error("Something went wrong.")
      }
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(
        `/api/author-api/stories/${params.storyId}/reviews/${reviewId}`
      )
      toast.success("Review deleted.")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong.", error.response?.data?.message)
      } else {
        toast.error("Something went wrong.")
      }
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  useEffect(() => {}, [])

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        title="Are you sure?"
        description="This action cannot be undone."
      />
      <Card className="w-full mx-auto p-4 shadow-md border rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-xl">{summary}</CardTitle>
            {userId === user?.id && (
              <div className="flex items-center justify-center gap-3">
                <PencilIcon
                  className="h-6 w-6 cursor-pointer hover:scale-105"
                  onClick={() => handleEditReview(reviewId, summary, content)}
                />
                <Button
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  onClick={() => setOpen(true)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Link href={`/users/${poster}`} className="">
            <span className="text-lg">By </span>
            <span className="font-bold text-xl text-sky-400 hover:underline">
              {" "}
              {poster}
            </span>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-base">{content}</p>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center mt-4 ">
            <span className="text-base">
              {new Date(createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center gap-1"
                onClick={handleReviewLike}
              >
                <LucideThumbsUp className="w-4 h-4" /> {reviewLikes}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default ReviewBlock
