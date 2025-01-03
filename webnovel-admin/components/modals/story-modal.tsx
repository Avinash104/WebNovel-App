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
import { useStoryModal } from "@/hooks/use-story-modal"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"
import TagSelector from "../tag-selector"

const formSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Name must be at least 4 characters long." }),
  description: z
    .string()
    .min(4, { message: "Description must be at least 4 characters long." })
    .max(400, { message: "Description must be at most 400 characters long." }),
  tags: z
    .array(z.string())
    .min(4, { message: "You must add at least four tags." }),
})

export const StoryModal = () => {
  const storyModal = useStoryModal()
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: [],
    },
  })

  useEffect(() => {
    form.setValue("tags", selectedTags)
  }, [selectedTags, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      console.log("Submitting form", values)
      const payload = { ...values, tags: selectedTags }
      const response = await axios.post("/api/stories", payload)
      window.location.assign(`/${response.data.userId}/${response.data.id}`)
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
      description="Add a new story!!"
      isOpen={storyModal.isOpen}
      onClose={storyModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={(event) => {
                      event.preventDefault()
                      storyModal.onClose()
                      form.reset()
                      setSelectedTags([])
                    }}
                  >
                    Cancel
                  </Button>
                  <Button disabled={loading} type="submit">
                    Create
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
