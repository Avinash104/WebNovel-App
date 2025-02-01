import CommentSection from "@/app/(home)/components/comment-section"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { MembershipLevel } from "@prisma/client"
import React from "react"
import ChapterContent from "./component/chapter-content"

const StoryPage = async ({
  params,
}: {
  params: { storyId: string; chapterId: string }
}) => {
  const user = await currentUser()
  const storyId = params?.storyId
  const chapterId = params?.chapterId

  // Fetch the chapter and its sequence
  const chapter = await prismadb.chapter.findUnique({
    where: {
      id: chapterId,
    },
    select: {
      content: true,
      title: true,
      sequence: true, // Using sequence for chapter order
    },
  })

  const comments = await prismadb.comment.findMany({
    where: {
      commentType: "CHAPTER",
      chapterId,
    },
    include: {
      replies: true, // Ensure replies are included
    },
  })

  if (!chapter?.content) {
    return <p>Loading...</p>
  }

  // Get total published chapters for this story
  const totalChapters = await prismadb.chapter.count({
    where: {
      storyId,
      published: true,
    },
  })

  // Fetch all membership levels for this story
  const storyMembershipLevels = await prismadb.membershipLevel.findMany({
    where: { storyId },
    select: { chaptersLocked: true },
  })

  // Calculate max early access chapters
  const maxEarlyAccessChapters = Math.max(
    ...storyMembershipLevels.map(
      (level: MembershipLevel) => level.chaptersLocked || 0
    )
  )

  console.log("Max number of early access chapters", maxEarlyAccessChapters)

  // Calculate free chapters
  const freeChapters = totalChapters - maxEarlyAccessChapters
  console.log("free chapters", freeChapters)

  // Check if the chapter is free
  const isChapterFree = chapter.sequence <= freeChapters
  console.log("is free: ", isChapterFree)

  let isAuthorized = false

  // Check user membership if logged in
  if (user) {
    const userMembership = await prismadb.membership.findFirst({
      where: {
        userId: user.id,
        storyId,
      },
      select: {
        membershipLevel: {
          select: { chaptersLocked: true },
        },
      },
    })

    if (userMembership) {
      const userEarlyAccessChapters =
        freeChapters + userMembership.membershipLevel.chaptersLocked

      isAuthorized = chapter.sequence <= userEarlyAccessChapters
    }
  }

  // Deny access if not authorized and not a free chapter
  if (!isChapterFree && !isAuthorized) {
    return (
      <p>
        You do not have access to this chapter. Please subscribe to unlock it.
      </p>
    )
  }

  return (
    <div>
      <ChapterContent chapter={chapter} totalChapters={totalChapters} />
      <CommentSection comments={comments} chapterId={chapterId} />
    </div>
  )
}

export default StoryPage
