"use client"

import CategorySelector from "@/components/category-selector"
import ImageUploader from "@/components/image-uploader"
import { MembershipLevelSelector } from "@/components/membership-level-selector"
import { AlertModal } from "@/components/modals/alert-modal"
import TagSelector from "@/components/tag-selector"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Category, MembershipLevel } from "@prisma/client"
import axios from "axios"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

interface StorySettingsFormProps {
  initialData: Story
}

const membershipLevelSchema = z.object({
  title: z.enum(["BRONZE", "SILVER", "GOLD"]),
  chaptersLocked: z
    .number()
    .int({ message: "Must be an integer" })
    .min(1, { message: "Must lock at least 1 chapter" }),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive({ message: "Price must be a positive number." })
    .min(0, { message: "Price must be greater than or equal to 0" }),
})

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters long." }),
  description: z
    .string()
    .min(4, { message: "Description must be at least 4 characters long." })
    .max(400, { message: "Description must be at most 400 characters long." }),
  tags: z
    .array(z.string())
    .min(4, { message: "You must add at least four tags." }),
  image: z.string().optional(),
  categories: z
    .array(z.string())
    .min(2, {
      message: "You have to select at least two categories.",
    })
    .refine((value) => value.some((item) => item), {
      message: "Category selection cannot be empty.",
    }),
  subscriptionAllowed: z.boolean(),
  membershipLevels: z
    .array(membershipLevelSchema)
    .min(1, { message: "You must define at least one membership level." }),
})

type Story = {
  title: string
  description: string
  image?: string
  tags: string[]
  categories?: Category[]
  subscriptionAllowed?: boolean
  membershipLevels?: MembershipLevel[]
}

type StorySettingsFormValues = z.infer<typeof formSchema>

export const StorySettingsForm: React.FC<StorySettingsFormProps> = ({
  initialData,
}) => {
  const params = useParams()
  const router = useRouter()
  const { storyId } = params

  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isSubscriptionAllowed, setIsSubscriptionAllowed] =
    useState<boolean>(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData.tags)
  const [storyCategories, setStoryCategories] = useState<Category[]>([])

  const form = useForm<StorySettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      categories: initialData.categories?.map((cat) => cat.id) || [],
      membershipLevels: initialData.membershipLevels?.map((level) => ({
        title: level.title,
        chaptersLocked: level.chaptersLocked,
        price: level.price,
      })) || [{ title: "BRONZE", chaptersLocked: 1, price: 0.99 }],
    },
  })

  useEffect(() => {
    if (!isSubscriptionAllowed) {
      form.setValue("membershipLevels", [])
    }
  }, [isSubscriptionAllowed, form])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/author-api/stories/category")
        setStoryCategories(response.data)
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
    fetchCategories()

    setIsSubscriptionAllowed(initialData.subscriptionAllowed ?? false)
  }, [initialData, form])

  useEffect(() => {
    console.log("Form Errors:", form.formState.errors)
  }, [form.formState.errors])

  const onSubmit = async (values: StorySettingsFormValues) => {
    try {
      setLoading(true)
      const payload = { ...values, tags: selectedTags }
      console.log("submitting to storyId", payload)
      await axios.patch(`/api/author-api/stories/${storyId}`, payload)
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
      await axios.delete(`/api/author-api/stories/${storyId}`)
      router.refresh()
      router.push("/admin")
      toast.success("Story deleted.")
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
          title="Story settings"
          description="Manage story preferences"
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
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-rows gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Story name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value ? field.value : ""}
                      disabled={loading}
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Story description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TagSelector
              form={form}
              loading={loading}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
            <CategorySelector form={form} storyCategories={storyCategories} />
            <FormField
              control={form.control}
              name="subscriptionAllowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allow Subscription?</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={isSubscriptionAllowed}
                      onCheckedChange={() => {
                        field.onChange(!field.value)
                        setIsSubscriptionAllowed(field.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSubscriptionAllowed && (
              <MembershipLevelSelector form={form} loading={loading} />
            )}
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  )
}
