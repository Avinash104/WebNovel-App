"use client"

import { Chapter } from "@prisma/client"
import axios from "axios"
import { useParams } from "next/navigation"
import React, { useEffect, useRef } from "react"

interface ChapterContentProps {
  chapter: Chapter
  totalChapters: number
}
const ChapterContent: React.FC<ChapterContentProps> = ({
  chapter,
  totalChapters,
}) => {
  const params = useParams()
  const hasViewed = useRef(false)

  useEffect(() => {
    if (!hasViewed.current) {
      axios.post(`/api/public-api/chapters/${params.chapterId}/view`)
    }
  }, [params.chapterId, params.storyId])

  return (
    <>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
      <p className="text-center my-2">{`Chapter ${chapter.sequence} of ${totalChapters}`}</p>
    </>
  )
}

export default ChapterContent
