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
        `/api/author-api/stories/${params.storyId}/chapters/${selectedChapterId}`
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
        title="Are you sure?"
        description="This action cannot be undone."
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

// "use client"

// import { AlertModal } from "@/components/modals/alert-modal"
// import { ChapterEditModal } from "@/components/modals/chapter-edit-modal"
// import { Button } from "@/components/ui/button"
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableRow,
// } from "@/components/ui/table"
// import { useChapterEditModal } from "@/hooks/use-chapter-edit-modal"
// import axios from "axios"
// import { ClipboardEdit, Trash } from "lucide-react"
// import { useParams } from "next/navigation"
// import React, { useState } from "react"
// import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
// import { toast } from "react-hot-toast"
// import PublishButton from "./publishButton"

// type Chapter = {
//   id: string
//   title: string
//   sequence: number
//   published: boolean
// }

// interface ChapterListProps {
//   chapters: Chapter[]
// }

// export const ChapterList: React.FC<ChapterListProps> = ({
//   chapters: initialChapters,
// }) => {
//   const params = useParams()
//   const chapterEditModal = useChapterEditModal()

//   const [open, setOpen] = useState<boolean>(false)
//   const [loading, setLoading] = useState<boolean>(false)
//   const [selectedChapterId, setSelectedChaptersId] = useState<string>("")
//   const [chapters, setChapters] = useState<Chapter[]>([...initialChapters])

//   const onDelete = async () => {
//     try {
//       setLoading(true)
//       await axios.delete(
//         `/api/author-api/stories/${params.storyId}/chapters/${selectedChapterId}`
//       )
//       toast.success("Chapter deleted.")
//       window.location.reload()
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         toast.error("Something went wrong!!", error.response?.data?.message)
//       } else {
//         toast.error("Something went wrong!!")
//       }
//     } finally {
//       setLoading(false)
//       setOpen(false)
//     }
//   }

//   const handleDragEnd = async (result: any) => {
//     if (!result.destination) return

//     // Reorder chapters in the local state
//     const reorderedChapters = Array.from(chapters)
//     const [removed] = reorderedChapters.splice(result.source.index, 1)
//     reorderedChapters.splice(result.destination.index, 0, removed)

//     // Update sequence values
//     const updatedChapters = reorderedChapters.map((chapter, index) => ({
//       ...chapter,
//       sequence: index + 1,
//     }))

//     setChapters(updatedChapters)

//     try {
//       // Persist changes to the server
//       await axios.put("/api/author-api/chapters/reorder", {
//         reorderedChapters: updatedChapters,
//       })
//       toast.success("Chapters reordered successfully.")
//     } catch (error) {
//       console.error("Error saving reordered chapters:", error)
//       toast.error("Failed to reorder chapters.")
//     }
//   }

//   return (
//     <>
//       <ChapterEditModal chapterId={selectedChapterId} />
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
// title="Are you sure?"
//         description="This action cannot be undone."
//       />
//       <DragDropContext onDragEnd={handleDragEnd}>
//         <Droppable droppableId="chapters">
//           {(provided) => (
//             <Table ref={provided.innerRef} {...provided.droppableProps}>
//               <TableCaption>List of chapters.</TableCaption>
//               {chapters.length > 0 ? (
//                 <TableBody>
//                   {chapters.map((chapter, index) => (
//                     <Draggable
//                       key={chapter.id}
//                       draggableId={chapter.id}
//                       index={index}
//                     >
//                       {(provided) => (
//                         <TableRow
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className="border rounded-md p-2 shadow-sm flex flex-nowrap justify-between gap-1 active:bg-gray-100 hover:shadow-md hover:text-lg"
//                         >
//                           <TableCell className="flex items-center justify-between text-sm">
//                             <span className="flex items-center gap-1">
//                               <p className="text-sm md:text-lg">
//                                 Chapter {chapter.sequence}{" "}
//                               </p>
//                             </span>
//                           </TableCell>
//                           <TableCell className="flex items-center justify-between text-wrap text-sm md:text-lg">
//                             <span>{chapter.title}</span>
//                           </TableCell>
//                           <TableCell className="flex flex-col md:flex-row justify-center items-center gap-1">
//                             <PublishButton
//                               published={chapter.published}
//                               chapterId={chapter.id}
//                             />
//                             <div className="flex gap-1">
//                               <Button
//                                 disabled={loading}
//                                 variant="destructive"
//                                 size="sm"
//                                 className="h-9"
//                                 onClick={() => {
//                                   setSelectedChaptersId(chapter.id)
//                                   chapterEditModal.onOpen()
//                                 }}
//                               >
//                                 <ClipboardEdit className="h-4 w-3" />
//                               </Button>
//                               <Button
//                                 disabled={loading}
//                                 variant="destructive"
//                                 size="sm"
//                                 className="h-9"
//                                 onClick={() => {
//                                   setOpen(true)
//                                   setSelectedChaptersId(chapter.id)
//                                 }}
//                               >
//                                 <Trash className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </TableBody>
//               ) : (
//                 <TableBody className="text-center p-4 text-sm">
//                   <TableRow>
//                     <TableCell>No chapters available.</TableCell>
//                   </TableRow>
//                 </TableBody>
//               )}
//             </Table>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </>
//   )
// }
