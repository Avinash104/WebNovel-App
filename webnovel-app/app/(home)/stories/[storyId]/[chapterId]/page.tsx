import CommentSection from "@/app/(home)/components/comment-section"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { Chapter, MembershipLevel } from "@prisma/client"
import React from "react"
import ChapterContent from "./component/chapter-content"
import ChapterNavHeader from "./component/chapter-nav-header"
import ChapterTitle from "./component/chapter-title"
import NoChapterAccess from "./component/no-chapter-access"

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
  let membership
  let isSubscribed = false
  let subscriptionLevel = ""

  // Check for user membership if logged in
  if (user) {
    const userProfile = await prismadb.profile.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          where: { storyId },
          include: {
            membershipLevel: true,
          },
        },
      },
    })

    if (userProfile) {
      membership = userProfile.memberships[0] || null
      isSubscribed = Boolean(membership)
      subscriptionLevel = membership?.membershipLevel?.title
    }

    const userMembership = await prismadb.membership.findFirst({
      where: {
        userId: user.id,
        storyId,
        OR: [
          { expiresAt: null }, // Auto-renew enabled (never expires)
          { expiresAt: { gt: new Date() } }, // Still active
        ],
      },
      select: {
        membershipLevel: {
          select: { title: true, chaptersLocked: true },
        },
      },
    })

    if (userMembership) {
      const userEarlyAccessChapters =
        freeChapters + userMembership.membershipLevel.chaptersLocked

      isAuthorized = chapter.sequence <= userEarlyAccessChapters
    }
  }

  //Chapter navigation
  const story = await prismadb.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: {
        where: { published: true },
        orderBy: { createdAt: "asc" }, // Sort in ascending order
      },
    },
  })

  const chapters = story?.chapters || []
  const currentChapterIndex: number = chapters.findIndex(
    (ch: Chapter) => ch.id === chapterId
  )

  const prevChapter =
    currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null
  const nextChapter =
    currentChapterIndex < chapters.length
      ? chapters[currentChapterIndex + 1]
      : null

  console.log("current chp index :", currentChapterIndex)
  console.log("prev chp Id :", prevChapter?.title)
  console.log("next chp Id :", nextChapter?.title)

  // Deny access if not authorized and not a free chapter
  if (!isChapterFree && !isAuthorized) {
    return (
      <div>
        <ChapterNavHeader
          prevChapterId={prevChapter?.id}
          nextChapterId={nextChapter?.id}
          storyTitle={story.title}
        />
        <ChapterTitle title={chapter.title} />
        <NoChapterAccess
          storyMembershipLevels={storyMembershipLevels}
          membership={membership}
          isSubscribed={isSubscribed}
          subscriptionLevel={subscriptionLevel}
        />
      </div>
    )
  }

  return (
    <div>
      <ChapterNavHeader
        prevChapterId={prevChapter?.id}
        nextChapterId={nextChapter?.id}
        storyTitle={story.title}
      />
      <ChapterTitle title={chapter.title} />
      <ChapterContent chapter={chapter} totalChapters={totalChapters} />
      <CommentSection comments={comments} chapterId={chapterId} />
    </div>
  )
}

export default StoryPage
