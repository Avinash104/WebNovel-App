import CommentSection from "@/app/(home)/components/comment-section"
import prismadb from "@/lib/prismadb"
import { CommentType } from "@/lib/utils"
import { Comment } from "@prisma/client"
import React from "react"

const ProfileWallSection = () => {
  const comments = prismadb.comment.findMany({
    where: { authorId: profile.id, commentType: CommentType.PROFILE_WALL },
  })

  return (
    <div>
      <CommentSection comments={comments} />
    </div>
  )
}

export default ProfileWallSection
