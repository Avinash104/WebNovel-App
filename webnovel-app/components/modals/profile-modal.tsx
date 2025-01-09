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
import { useProfileModal } from "@/hooks/use-profile-modal"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

const formSchema = z.object({
  username: z.string().min(1),
})

export const ProfileModal = () => {
  const params = useParams()

  const profileModal = useProfileModal()

  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await axios.patch(
        `/api/profile/${params.profileId}`,
        values
      )
      window.location.assign(`/admin/${response.data.id}/profile`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Something went wrong!!")
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Create a profile!"
      description="Add a new profile for yourself."
      isOpen={profileModal.isOpen}
      onClose={profileModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Name"
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
                    onClick={profileModal.onClose}
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
