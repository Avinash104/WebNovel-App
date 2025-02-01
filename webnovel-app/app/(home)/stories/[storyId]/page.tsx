import CommentSection from "@/app/(home)/components/comment-section"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { Chapter, Profile } from "@prisma/client"
import Link from "next/link"
import React from "react"
import StoryHeader from "../component/story-header"

const StoryPage = async ({ params }: { params: { storyId: string } }) => {
  const { storyId } = params

  const story = await prismadb.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      categories: true,
      chapters: { where: { published: true }, orderBy: { createdAt: "desc" } },
      membershipLevels: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  const comments = await prismadb.comment.findMany({
    where: {
      commentType: "STORY",
      storyId,
    },
    include: {
      replies: true, // Ensure replies are included
    },
  })

  const authorProfile = await prismadb.profile.findUnique({
    where: {
      id: story.userId,
    },
    include: { followers: true },
  })

  const author = authorProfile.username

  const totalViewsData = await prismadb.chapter.aggregate({
    where: { storyId, published: true },
    _sum: {
      views: true,
    },
  })

  const totalViews = totalViewsData._sum.views || 0

  if (!story) {
    return <div>Story not found</div>
  }

  const user = await currentUser()

  let isFavorited = false
  let isSubscribed = false
  let membership = null
  let subscriptionLevel = ""
  let isAuthorFollowedByUser = false

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
      isFavorited = userProfile.favoriteStories.some(
        (fav: string) => fav === storyId
      )
      membership = userProfile.memberships[0] || null
      isSubscribed = Boolean(membership)

      subscriptionLevel = membership?.membershipLevel?.title

      isAuthorFollowedByUser = authorProfile.followers.some(
        (user: Profile) => user.id === userProfile.id
      )
    }
  }

  return (
    <>
      <div>
        <StoryHeader
          story={story}
          membership={membership}
          favorited={isFavorited}
          isSubscribed={isSubscribed}
          subscriptionLevel={subscriptionLevel}
          totalViews={totalViews}
          author={author}
          isAuthorFollowedByUser={isAuthorFollowedByUser}
        />
      </div>
      <div>
        {story.chapters.map((chapter: Chapter) => (
          <div key={chapter.id} className="mb-4">
            <Link href={`/stories/${storyId}/${chapter.id}`}>
              <p className="text-blue-500 hover:underline">{chapter.title}</p>
            </Link>
          </div>
        ))}
      </div>
      <div>
        <CommentSection comments={comments} storyId={storyId} />
      </div>
    </>
  )
}

export default StoryPage
