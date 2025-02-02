"use client"

import { ArrowBigLeft, ArrowBigRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

interface ChapterNavHeaderProps {
  prevChapterId: string
  nextChapterId: string
  storyTitle: string
}
const ChapterNavHeader: React.FC<ChapterNavHeaderProps> = ({
  prevChapterId,
  nextChapterId,
  storyTitle,
}) => {
  const params = useParams()

  return (
    <div className="flex items-center justify-between w-full">
      {prevChapterId ? (
        <Link href={`/stories/${params.storyId}/${prevChapterId}`}>
          <ArrowBigLeft className="h-10 w-10" />
        </Link>
      ) : (
        <div className="w-10" />
      )}

      <Link href={`/stories/${params.storyId}`}>
        <h2 className="text-center text-3xl font-semibold">{storyTitle}</h2>
      </Link>

      {nextChapterId ? (
        <Link href={`/stories/${params.storyId}/${nextChapterId}`}>
          <ArrowBigRight className="h-10 w-10" />
        </Link>
      ) : (
        <div className="w-10" />
      )}
    </div>
  )
}

export default ChapterNavHeader
