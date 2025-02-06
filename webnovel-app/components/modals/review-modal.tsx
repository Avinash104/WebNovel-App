"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { useReviewModal } from "@/hooks/use-review-modal"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

const formSchema = z.object({
  summary: z.string().min(3).max(255),
  content: z.string().min(3).max(20000),
})

export const ReviewModal = ({}) => {
  const reviewModal = useReviewModal()
  const params = useParams()
  const { storyId } = params
  const [loading, setLoading] = useState(false)
  const [existingReviewId, setExistingReviewId] = useState<string>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: "",
      content: "",
    },
  })

  useEffect(() => {
    if (!reviewModal.isOpen || !storyId) return

    form.reset({
      summary: reviewModal.summary || "",
      content: reviewModal.content || "",
    })

    const fetchReviewForUser = async () => {
      setLoading(true)
      try {
        const response = await axios.get(
          `/api/author-api/stories/${storyId}/reviews`
        )
        if (response.data) {
          toast.success("You have an existing review for this story.")
          setExistingReviewId(response.data.id)
          form.reset({
            summary: response.data.summary || "",
            content: response.data.content || "",
          })
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            "Error while fetching the existing review.",
            error.response?.data?.message
          )
        } else {
          toast.error("Error while fetching the existing review.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReviewForUser()
  }, [reviewModal, form, storyId])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      if (!reviewModal.reviewId || !existingReviewId) {
        await axios.post(`/api/author-api/stories/${storyId}/reviews`, values)
        toast.success("New review added.")
      } else {
        await axios.patch(
          `/api/author-api/stories/${storyId}/reviews/${reviewModal.reviewId}`,
          values
        )
        toast.success("Review updated.")
      }
      reviewModal.onClose()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Add a new review.."
      description=""
      isOpen={reviewModal.isOpen}
      onClose={reviewModal.onClose}
    >
      <div className="space-y-4 py-2 pb-4">
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField<z.infer<typeof formSchema>>
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full text-lg"
                        disabled={loading}
                        placeholder="A crisp summary for your review..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<z.infer<typeof formSchema>>
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="border rounded-md">
                        <Textarea
                          className="w-full"
                          disabled={loading}
                          placeholder="Review description"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button
                  disabled={loading}
                  variant="outline"
                  onClick={(event) => {
                    event.preventDefault()
                    reviewModal.onClose()
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button disabled={loading} type="submit">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  )
}
