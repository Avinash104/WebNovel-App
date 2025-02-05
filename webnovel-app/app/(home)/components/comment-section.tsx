"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@clerk/nextjs"
import { Comment } from "@prisma/client"
import axios, { AxiosResponse } from "axios"
import {
  LucideThumbsDown,
  LucideThumbsUp,
  PencilIcon,
  Trash,
} from "lucide-react"
import Link from "next/link"
import React, { useRef, useState } from "react"
import { toast } from "react-hot-toast"

interface CommentSectionProps {
  comments: Comment[]
  chapterId?: string
  storyId?: string
  authorId?: string
  storeItemId?: string
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments: initialComments,
  chapterId,
  storyId,
  authorId,
  storeItemId,
}) => {
  const { user } = useUser()

  let commentType: string

  if (chapterId) {
    commentType = "CHAPTER"
  } else if (storyId) {
    commentType = "STORY"
  } else if (authorId) {
    commentType = "PROFILE_WALL"
  } else if (storeItemId) {
    commentType = "STORE_ITEM"
  } else {
    toast.error("No Commnets")
  }

  const [loading, setLoading] = useState<boolean>(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState<string>("")
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const replyInputRef = useRef<HTMLInputElement | null>(null) // Reference for the reply input
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<string>("")
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  const handleLikes = async (commentId: string, responseType: string) => {
    if (!user) {
      toast.error("You have to log in to like a comment.")
    }

    setLoading(true)
    try {
      console.log("values : ", commentId, responseType)
      const payload = { responseType: responseType }
      console.log("payload :", payload)
      await axios.patch(`/api/author-api/comments/${commentId}`, payload)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Something went wrong!!")
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    if (!user) {
      toast.error("You have to log in to add a comment.")
    }

    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: AxiosResponse<any, any>
      if (chapterId) {
        response = await axios.post("/api/author-api/comments", {
          content: newComment,
          chapterId,
          commentType: commentType,
        })
      }
      if (storyId) {
        response = await axios.post("/api/author-api/comments", {
          content: newComment,
          storyId,
          commentType: commentType,
        })
      }
      if (authorId) {
        response = await axios.post("/api/author-api/comments", {
          content: newComment,
          authorId,
          commentType: commentType,
        })
      }
      if (storeItemId) {
        response = await axios.post("/api/author-api/comments", {
          content: newComment,
          storeItemId,
          commentType: commentType,
        })
      }
      setComments((prev) => [...prev, response.data])
      setNewComment("")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Something went wrong!!")
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent[parentId]?.trim()) return

    if (!user) {
      toast.error("You have to log in to reply.")
    }

    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: AxiosResponse<any, any>

      if (chapterId) {
        response = await axios.post("/api/author-api/comments", {
          content: replyContent[parentId],
          chapterId,
          commentType: "CHAPTER",
          parentId,
          isReply: true,
        })
      }

      if (storyId) {
        response = await axios.post("/api/author-api/comments", {
          content: replyContent[parentId],
          storyId,
          commentType: "STORY",
          parentId,
          isReply: true,
        })
      }

      if (authorId) {
        response = await axios.post("/api/author-api/comments", {
          content: replyContent[parentId],
          authorId,
          commentType: "PROFILE_WALL",
          parentId,
          isReply: true,
        })
      }

      if (storeItemId) {
        response = await axios.post("/api/author-api/comments", {
          content: replyContent[parentId],
          storeItemId,
          commentType: "STORE_ITEM",
          parentId,
          isReply: true,
        })
      }
      setComments((prev) => [...prev, response.data]) // Add reply to the comments list
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }))
      setReplyingTo(null)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Something went wrong!!")
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (commentId: string) => {
    try {
      console.log("Inside delete function: ", commentId)
      setLoading(true)
      await axios.delete(`/api/author-api/comments/${commentId}`)
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      toast.success("Comment deleted.")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong.", error.response?.data?.message)
      } else {
        toast.error("Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReplyButtonClick = (commentId: string) => {
    setReplyingTo(commentId)
    setTimeout(() => {
      replyInputRef.current?.focus() // Move focus to the input field
    }, 0)
  }

  // Handle Edit Button Click
  const handleEditButtonClick = (commentId: string, content: string) => {
    setEditingCommentId(commentId)
    setEditingContent(content)
  }

  // Handle Save Edit
  const handleSaveEdit = async (commentId: string) => {
    if (!editingContent.trim()) return

    setLoading(true)
    try {
      await axios.patch(`/api/author-api/comments/${commentId}`, {
        content: editingContent,
      })
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: editingContent }
            : comment
        )
      )
      setEditingCommentId(null)
      setEditingContent("")
      toast.success("Comment updated!")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Something went wrong!!")
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent("")
  }

  const onDeleteConfirm = async () => {
    if (commentToDelete) {
      await onDelete(commentToDelete)
      setCommentToDelete(null) // Reset after deletion
    }
  }

  const renderComments = (comments: Comment[]) => {
    const topLevelComments = comments.filter(
      (comment) => comment.isReply === false
    )

    return topLevelComments.map((comment) => (
      <div key={comment.id} className="px-4 py-2 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-lg">
            <Link
              href={`/${comment.poster}`}
              className="text-cyan-500 font-semibold"
            >
              {comment.poster}{" "}
            </Link>
            posted on{" "}
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </p>
          {comment.userId === user?.id && (
            <div className="flex items-center justify-center gap-3">
              <AlertModal
                isOpen={commentToDelete === comment.id}
                onClose={() => setCommentToDelete(null)}
                onConfirm={onDeleteConfirm}
                loading={loading}
                title="Are you sure?"
                description="This action cannot be undone."
              />
              <PencilIcon
                className="h-6 w-6 cursor-pointer text-gray-500"
                onClick={() =>
                  handleEditButtonClick(comment.id, comment.content)
                }
              />
              <Button
                disabled={loading}
                variant="destructive"
                size="sm"
                onClick={() => setCommentToDelete(comment.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {editingCommentId === comment.id ? (
          // Edit Input
          <div className="flex flex-col gap-2 w-full md:w-2/3">
            <Input
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="Edit your comment..."
              className="w-full"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleSaveEdit(comment.id)}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                size="sm"
                className="mt-2"
                onClick={handleCancelEdit}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Display Comment
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-900 dark:text-gray-100">
                {comment.content}
              </p>
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button
            size="sm"
            disabled={loading}
            className="mt-2"
            onClick={() => handleReplyButtonClick(comment.id)}
          >
            Reply
          </Button>

          <div className="flex items-center justify-center gap-2">
            <LucideThumbsUp
              className="h-6 w-6 cursor-pointer"
              onClick={() => handleLikes(comment.id, "like")}
            />{" "}
            {comment.likes}
            <LucideThumbsDown
              className="h-6 w-6 cursor-pointer"
              onClick={() => handleLikes(comment.id, "dislike")}
            />{" "}
            {comment.dislikes}
          </div>
        </div>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="mt-2">
            <Input
              className="w-full md:w-1/2"
              ref={replyInputRef}
              placeholder="Write a reply..."
              value={replyContent[comment.id] || ""}
              onChange={(e) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
            />
            <Button
              size="sm"
              className="mt-2"
              disabled={loading}
              onClick={() => handleAddReply(comment.id)}
            >
              Post Reply
            </Button>
          </div>
        )}

        {/* Render Replies */}
        {comments
          .filter((reply) => reply.isReply && reply.parentId === comment.id)
          .map((reply) => (
            <div
              key={reply.id}
              className="ml-8 mt-2 pl-4 border-l border-gray-300 dark:border-gray-700"
            >
              <div className="flex items-center justify-start">
                <p className="text-lg">
                  <Link
                    href={`/${comment.poster}`}
                    className="text-cyan-500 font-semibold"
                  >
                    {comment.poster}{" "}
                  </Link>
                  posted
                </p>
                {reply.userId === user?.id && (
                  <div className="mx-2">
                    <AlertModal
                      isOpen={commentToDelete === reply.id}
                      onClose={() => setCommentToDelete(null)}
                      onConfirm={onDeleteConfirm}
                      loading={loading}
                      title="Are you sure?"
                      description="This action cannot be undone."
                    />
                    <Button
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                      onClick={() => setCommentToDelete(reply.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-start gap-2">
                <p className="text-gray-700 dark:text-gray-300">
                  {reply.content}
                </p>
                <LucideThumbsUp
                  className="cursor-pointer"
                  onClick={() => handleLikes(reply.id, "like")}
                />{" "}
                {reply.likes}
                <LucideThumbsDown
                  className="cursor-pointer"
                  onClick={() => handleLikes(reply.id, "dislike")}
                />{" "}
                {reply.dislikes}
              </div>
            </div>
          ))}
      </div>
    ))
  }

  return (
    <>
      <div className="p-4 mt-5 bg-white dark:bg-gray-800 rounded-lg shadow-md pl-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Comments
        </h3>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Textarea
            className="w-full max-h-[70px]"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            disabled={loading}
            className="mt-2"
            onClick={handleAddComment}
          >
            Post Comment
          </Button>
        </div>

        <div className="mt-6">
          {comments.length > 0 ? (
            renderComments(comments)
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No comments yet.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default CommentSection
