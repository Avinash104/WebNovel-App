import PDFUploader from "@/components/pdf-uploader"
// import TipTapEditor from "@/components/text-editor"
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
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"

const storeFormSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().nonempty("Description is required"),
  price: z.number().positive("Price must be a positive number"),
  pdfLink: z.string().nonempty("Please upload a PDF."),
  thumbnail: z.string(),
})

export const StoreItemForm = () => {
  const params = useParams()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      pdfLink: "",
      thumbnail: "",
    },
  })
  const onSubmit = async (values: z.infer<typeof storeFormSchema>) => {
    try {
      setLoading(true)
      console.log("Values: ", values)
      await axios.post(`/api/profile/${params.profileId}/store`, values)
      window.location.reload()
      toast.success("Item added to the store.")
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

  useEffect(() => {
    console.log("Form Errors:", form.formState.errors)
  }, [form.formState.errors])

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter story title"
                    disabled={loading}
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
                  {/* <TipTapEditor
                    initialContent={field.value}
                    onUpdate={(content: string) => field.onChange(content)}
                    disabled={loading}
                  /> */}
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
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="Enter price"
                    disabled={loading}
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
            name="pdfLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload PDF</FormLabel>
                <FormControl>
                  <PDFUploader
                    value={field.value ? field.value : ""}
                    disabled={loading}
                    onChange={({ pdfLink, thumbnail }) => {
                      field.onChange(pdfLink)
                      form.setValue("thumbnail", thumbnail)
                    }}
                    onRemove={() => {
                      field.onChange("")
                      form.setValue("thumbnail", "")
                    }}
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
                form.reset()
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
  )
}
