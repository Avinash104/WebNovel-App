"use client"

import { Button } from "@/components/ui/button"
import { useChapterModal } from "@/hooks/use-chapter-modal"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { ChapterList } from "./components/chapter-list"

type Chapter = {
  id: string
  title: string
  sequence: number
  published: boolean
}

const ChaptersPage = ({
  params: { storyId },
}: {
  params: { profileId: string; storyId: string }
}) => {
  const chapterModal = useChapterModal()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/stories/${storyId}/chapters`)
        setChapters(response.data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            "Error while fetching the chapters.",
            error.response?.data?.message
          )
        } else {
          toast.error("Error while fetching the chapters.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchChapters()
  }, [storyId])

  return (
    <div className="w-full">
      <div className="space-y-4 p-4 sm:p-8 pt-6 w-full">
        This is the chapters page{" "}
        <Button onClick={chapterModal.onOpen}>Add</Button>
        <div className="w-full">
          {loading ? (
            <div>Loading chapters...</div>
          ) : (
            !loading && <ChapterList chapters={chapters} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChaptersPage
