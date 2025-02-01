"use client"

import TipTapEditor from "@/components/text-editor"
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
import { useChapterEditModal } from "@/hooks/use-chapter-edit-modal"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

const formSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(3),
})

interface ChapterEditModalProps {
  chapterId: string
}

export const ChapterEditModal: React.FC<ChapterEditModalProps> = ({
  chapterId,
}) => {
  const chapterEditModal = useChapterEditModal()
  const params = useParams()
  const { storyId } = params

  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `/api/author-api/stories/${storyId}/chapters/${chapterId}`
        )
        form.reset({
          title: response.data.title || "",
          content: response.data.content || "",
        })
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

    fetchChapter()
  }, [chapterId, storyId, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      await axios.patch(
        `/api/author-api/stories/${storyId}/chapters/${chapterId}`,
        values
      )
      handleClose()
      toast.success("Chapter edit successful!!")
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

  const handleClose = () => {
    form.reset()
    chapterEditModal.onClose()
  }

  //ensure modal only renders when data is ready
  if (!chapterEditModal.isOpen || loading) return null

  return (
    <Modal
      title="Chapter Edit"
      description="Edit the chapter."
      isOpen={chapterEditModal.isOpen}
      onClose={chapterEditModal.onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
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
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <TipTapEditor
                    initialContent={field.value}
                    onUpdate={(content: string) => field.onChange(content)}
                    disabled={loading}
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
                handleClose()
              }}
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  )
}
