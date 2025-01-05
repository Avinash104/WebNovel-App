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
import { useStoreModal } from "@/hooks/use-store-modal"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import * as z from "zod"
import TipTapEditor from "../text-editor"

const storeFormSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().nonempty("Description is required"),
  price: z.number().positive("Price must be a positive number"),
  // pdf: z
  //   .instanceof(File)
  //   .refine(
  //     (file) => file.type === "application/pdf",
  //     "Uploaded file must be a PDF"
  //   )
  //   .optional(),
})

export const StoreModal = () => {
  const params = useParams()
  const storeModal = useStoreModal()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      pdf: null,
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
    <Modal
      title="Add to Store"
      description="Create a new addition to your store."
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
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
            <div className="flex items-center justify-center">
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
              {/* <FormField
                control={form.control}
                name="pdf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload PDF</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          form.setValue("pdf", file)
                        }}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            {/* <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Add Story"}
            </Button> */}
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button
                disabled={loading}
                variant="outline"
                onClick={(event) => {
                  event.preventDefault()
                  storeModal.onClose()
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
    </Modal>
  )
}
