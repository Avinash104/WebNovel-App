import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { Chapter } from "@prisma/client"
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

  const authorProfile = await prismadb.profile.findUnique({
    where: {
      id: story.userId,
    },
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
      console.log(membership?.membershipLevel?.title)
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
    </>
  )
}

export default StoryPage
