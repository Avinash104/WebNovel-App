import { Button } from "@/components/ui/button"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import React, { useState } from "react"
import { toast } from "react-hot-toast"

interface PublishButtonProps {
  chapterId: string
  published: boolean
}
const PublishButton: React.FC<PublishButtonProps> = ({
  chapterId,
  published,
}) => {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(false)
  const [isPublished, setIsPublished] = useState<boolean>(published)

  const handlePublish = async () => {
    try {
      setLoading(true)
      await axios.patch(
        `/api/stories/${params.storyId}/chapters/${chapterId}`,
        {
          published: !published,
        }
      )
      setIsPublished(!isPublished)
      toast.success("Chapter is " + (isPublished ? "unpublished" : "published"))
      router.refresh()
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
    <div>
      <Button
        disabled={loading}
        variant="secondary"
        size="sm"
        // className="h-9 hover:bg-gray-200"
        className={`h-9 ${
          isPublished
            ? "bg-gray-300 text-black hover:bg-gray-400"
            : "bg-green-500 text-white hover:bg-green-600"
        } transition-all duration-300`}
        onClick={() => {
          handlePublish()
        }}
      >
        {isPublished ? <p> Unpublish</p> : <p> Publish</p>}
      </Button>
    </div>
  )
}

export default PublishButton
