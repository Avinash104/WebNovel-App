import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { MembershipLevel } from "@prisma/client"
import React from "react"

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

  // Calculate free chapters
  const freeChapters = totalChapters - maxEarlyAccessChapters

  // Check if the chapter is free
  const isChapterFree = chapter.sequence <= freeChapters

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
        totalChapters - userMembership.membershipLevel.chaptersLocked
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
      <h3>{chapter.title}</h3>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
      <p>{`Chapter ${chapter.sequence} of ${totalChapters}`}</p>
    </div>
  )
}

export default StoryPage
