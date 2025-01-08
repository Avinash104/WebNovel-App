"use client"

import CategorySelector from "@/components/category-selector"
import ImageUploader from "@/components/image-uploader"
import { AlertModal } from "@/components/modals/alert-modal"
import TagSelector from "@/components/tag-selector"
import { ApiAlert } from "@/components/ui/api-alert"
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
import { useOrigin } from "@/hooks/use-origin"
import { zodResolver } from "@hookform/resolvers/zod"
import { Category } from "@prisma/client"
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

const formSchema = z.object({
  name: z.string().min(2),
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
      message: "You have to select at least two category.",
    })
    .refine((value) => value.some((item) => item)),
  subscriptionAllowed: z.boolean(),
  subscriptionPrice: z.number({ message: "Should be a number!" }).min(0),
  numberOfLockedChapters: z.number({ message: "Should be a number!" }).min(0),
})

type Story = {
  name: string
  description: string
  tags: string[]
  image?: string
  categories?: Category[]
  subscriptionAllowed?: boolean
  subscriptionPrice?: number
  numberOfLockedChapters?: number
}

type StorySettingsFormValues = z.infer<typeof formSchema>

export const StorySettingsForm: React.FC<StorySettingsFormProps> = ({
  initialData,
}) => {
  const params = useParams()
  const router = useRouter()
  const origin = useOrigin()
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
    },
  })

  useEffect(() => {
    if (!isSubscriptionAllowed) {
      form.setValue("subscriptionPrice", 0)
      form.setValue("numberOfLockedChapters", 0)
    }
  }, [isSubscriptionAllowed, form])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/stories/category")
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
      await axios.patch(`/api/stories/${storyId}`, payload)
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
      await axios.delete(`/api/stories/${storyId}`)
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-rows gap-8">
            <FormField
              control={form.control}
              name="name"
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
              <div className="">
                <FormField
                  control={form.control}
                  name="subscriptionPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Select price for the Gold Tier membership
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="In US dollars.."
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfLockedChapters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of chapters behind paywall</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="No. of chapters locked"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/stories/${params.storyId}`}
      />
    </>
  )
}
