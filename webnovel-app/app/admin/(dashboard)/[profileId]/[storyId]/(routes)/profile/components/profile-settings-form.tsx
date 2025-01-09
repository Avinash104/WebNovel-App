"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentLink } from "@prisma/client"
import axios from "axios"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

type Profile = {
  name: string
  paymentLinks: PaymentLink[]
}

interface ProfileSettingsFormProps {
  initialData: Profile
  numberOfStoriesForProfile: number
}

const formSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Author name must be at least 4 characters long." })
    .max(50, { message: "Author name can be at most 50 characters long." }),
  paymentLinks: z.array(z.string()),
})

type ProfileSettingsFormValues = z.infer<typeof formSchema>

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  initialData,
  numberOfStoriesForProfile,
}) => {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      paymentLinks:
        initialData.paymentLinks?.map((paymentLink) => paymentLink.id) || [],
    },
  })

  useEffect(() => {
    console.log(initialData, numberOfStoriesForProfile)
  }, [])

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    try {
      setLoading(true)
      console.log("submitting to storyId", values)
      await axios.patch(`/api/profile/${params.profileId}`, values)
      window.location.reload()
      toast.success("Story updated.")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong.", error.response?.data?.message)
      } else {
        toast.error("Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/profile/${params.profileId}`)
      router.refresh()
      router.push("/admin")
      toast.success("Profile deleted.")
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
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Profile settings"
          description="Manage your profile preferences"
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => {
            if (numberOfStoriesForProfile !== 0) {
              return toast.error(
                "Please delete all the stories under your profile first."
              )
            }
            setOpen(true)
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Author name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </>
  )
}

export default ProfileSettingsForm
