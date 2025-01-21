"use client"

import { Chapter } from "@prisma/client"
import React from "react"

interface ChapterContentProps {
  chapter: Chapter
  totalChapters: number
}
const ChapterContent: React.FC<ChapterContentProps> = ({
  chapter,
  totalChapters,
}) => {
  return (
    <div>
      <h3>{chapter.title}</h3>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
      <p>{`Chapter ${chapter.sequence} of ${totalChapters}`}</p>
    </div>
  )
}

export default ChapterContent
