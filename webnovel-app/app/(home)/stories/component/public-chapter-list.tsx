"use client"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Chapter } from "@prisma/client"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useState } from "react"

type Story = {
  title: string
  description: string
  image?: string
  tags: string[]
  views: number
  chapters: Chapter[]
}

interface PublicChapterListProps {
  story: Story
}

const PublicChapterList: React.FC<PublicChapterListProps> = ({ story }) => {
  const params = useParams()

  const chaptersPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)

  // **Calculate Pagination**
  const totalChapters = story?.chapters?.length || 0
  const totalPages = Math.ceil(totalChapters / chaptersPerPage)

  const startIndex = (currentPage - 1) * chaptersPerPage
  const endIndex = startIndex + chaptersPerPage
  const currentChapters = story?.chapters?.slice(startIndex, endIndex)

  return (
    <div className="px-6">
      {/* Chapter List */}
      {currentChapters.map((chapter: Chapter) => (
        <div key={chapter.id} className="mb-4">
          <Link
            className="flex items-center justify-around"
            href={`/stories/${params.storyId}/${chapter.id}`}
          >
            <p className="text-blue-500 hover:underline">{chapter.title}</p>
            <p>{new Date(chapter.createdAt).toLocaleString()}</p>
            <p className="text-left">Views: {chapter.views}</p>
          </Link>
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="mt-6 flex justify-center">
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
            </PaginationItem>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {/* Next Button */}
            <PaginationItem>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default PublicChapterList
