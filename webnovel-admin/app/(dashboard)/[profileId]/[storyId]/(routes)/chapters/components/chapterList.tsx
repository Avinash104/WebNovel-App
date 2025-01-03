"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { ChapterEditModal } from "@/components/modals/chapter-edit-modal"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { useChapterEditModal } from "@/hooks/use-chapter-edit-modal"
import axios from "axios"
import { ClipboardEdit, Trash } from "lucide-react"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { toast } from "react-hot-toast"
import PublishButton from "./publishButton"

type Chapter = {
  id: string
  title: string
  sequence: number
  published: boolean
}

interface ChapterListProps {
  chapters: Chapter[]
}

export const ChapterList: React.FC<ChapterListProps> = ({ chapters }) => {
  const params = useParams()
  const chapterEditModal = useChapterEditModal()

  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedChapterId, setSelectedChaptersId] = useState<string>("")

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(
        `/api/stories/${params.storyId}/chapters/${selectedChapterId}`
      )
      toast.success("Chapter deleted.")
      window.location.reload()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <ChapterEditModal chapterId={selectedChapterId} />
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Table>
        <TableCaption>List of chapters.</TableCaption>
        <>
          {chapters.length > 0 ? (
            <TableBody>
              {chapters &&
                chapters?.map((chapter) => (
                  <TableRow
                    key={chapter.id}
                    className="border rounded-md p-2 shadow-sm flex flex-nowrap justify-between gap-1 active:bg-gray-100 hover:shadow-md hover:text-lg"
                  >
                    <TableCell className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <p className="text-sm md:text-lg">
                          Chapter {chapter.sequence}{" "}
                        </p>
                      </span>
                    </TableCell>
                    <TableCell className="flex items-center justify-between text-wrap text-sm md:text-lg">
                      <span>{chapter.title}</span>
                    </TableCell>
                    <TableCell className="flex flex-col md:flex-row justify-center items-center gap-1">
                      <PublishButton
                        published={chapter.published}
                        chapterId={chapter.id}
                      />
                      <div className="flex gap-1">
                        <Button
                          disabled={loading}
                          variant="destructive"
                          size="sm"
                          className="h-9"
                          onClick={() => {
                            setSelectedChaptersId(chapter.id)
                            chapterEditModal.onOpen()
                          }}
                        >
                          <ClipboardEdit className="h-4 w-3" />
                        </Button>
                        <Button
                          disabled={loading}
                          variant="destructive"
                          size="sm"
                          className="h-9"
                          onClick={() => {
                            setOpen(true)
                            setSelectedChaptersId(chapter.id)
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          ) : (
            <TableBody className="text-center p-4 text-sm">
              <TableRow>
                <TableCell>No chapters available.</TableCell>
              </TableRow>
            </TableBody>
          )}
        </>
      </Table>
    </>
  )
}
