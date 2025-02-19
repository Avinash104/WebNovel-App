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
import { Modal } from "@/components/ui/modal"
import { useMessageModal } from "@/hooks/use-message-modal"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  message: z.string().min(3),
})

export const MessageModal = () => {
  const { user } = useUser()
  const messageModal = useMessageModal()
  const params = useParams()
  const { username } = params
  const [loading, setLoading] = useState(false)

  const senderId = user?.id
  const receiverId = messageModal.receiverId

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const payload = { ...values, receiverId, senderId }
      await axios.post(`/api/author-api/messages`, payload)
      console.log("Payload :", payload)
      toast.success("Message sent.")
      form.reset()
      messageModal.setReceiverId("")
      messageModal.onClose()
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
      title={`Send a private message to ${username}`}
      description=""
      isOpen={messageModal.isOpen}
      onClose={messageModal.onClose}
    >
      <div className="space-y-4 py-2 pb-4">
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField<z.infer<typeof formSchema>>
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={loading}
                        placeholder="Message"
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
                    messageModal.onClose()
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
    </Modal>
  )
}
