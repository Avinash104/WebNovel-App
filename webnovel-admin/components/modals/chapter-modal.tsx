"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

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
import { useChapterModal } from "@/hooks/use-chapter-modal"
import { useParams } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(3),
})

export const ChapterModal = () => {
  const chapterModal = useChapterModal()
  const params = useParams()
  const { profileId, storyId } = params
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      await axios.post(`/api/stories/${storyId}/chapters`, values)
      window.location.assign(`/${profileId}/${storyId}/chapters`)
      toast.success("New chapter added!!")
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
      title="Create story"
      description="Add a new story to manage products and categories."
      isOpen={chapterModal.isOpen}
      onClose={chapterModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField<z.infer<typeof formSchema>>
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Title of the chapter"
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
                        <Input
                          disabled={loading}
                          placeholder="Content of the chapter"
                          {...field}
                        />
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
                      chapterModal.onClose()
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button disabled={loading} type="submit">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  )
}
