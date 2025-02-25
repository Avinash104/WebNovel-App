import CommentSection from "@/app/(home)/components/comment-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prismadb from "@/lib/prismadb"
import { pageType } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { Category, Profile } from "@prisma/client"
import React from "react"
import PublicChapterList from "../component/public-chapter-list"
import ReviewSection from "../component/review-section"
import SimilarStories from "../component/similar-stories"
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

  // Get story comments with replies
  const comments = await prismadb.comment.findMany({
    where: {
      commentType: "STORY",
      storyId,
    },
    include: {
      replies: true,
    },
  })

  // Get story reviews
  const reviews = await prismadb.review.findMany({
    where: {
      storyId,
    },
    orderBy: {
      likes: "desc",
    },
  })

  const authorProfile = await prismadb.profile.findUnique({
    where: {
      id: story.userId,
    },
    include: { followers: true },
  })

  if (!story) {
    return <div>Story not found</div>
  }

  const user = await currentUser()

  let isFavorited = false
  let isSubscribed = false
  let membership = null
  let subscriptionLevel = ""
  let isAuthorFollowedByUser = false
  let userHasHundredComments = false

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

      const commentCount = await prismadb.comment.count({
        where: { userId: userProfile.id },
      })

      userHasHundredComments = commentCount > 100
    }
  }

  // Fetch similar stories
  const similarStories = await getSimilarStories(storyId)

  return (
    <>
      <div>
        <StoryHeader
          story={story}
          membership={membership}
          favorited={isFavorited}
          isSubscribed={isSubscribed}
          subscriptionLevel={subscriptionLevel}
          isAuthorFollowedByUser={isAuthorFollowedByUser}
        />
      </div>
      <div>
        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="w-full h-12">
            <TabsTrigger value="chapters" className="text-2xl">
              Chapters
            </TabsTrigger>
            <TabsTrigger value="glossary" className="text-2xl">
              Glossary
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-2xl">
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chapters">
            <PublicChapterList story={story} />
          </TabsContent>
          <TabsContent value="glossary">Glossary is here..!</TabsContent>
          <TabsContent value="reviews">
            {reviews && (
              <ReviewSection
                initialReviews={reviews}
                page={pageType.STORY}
                userHasHundredComments={userHasHundredComments}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <CommentSection comments={comments} storyId={storyId} />
        <SimilarStories similarStories={similarStories} />
      </div>
    </>
  )
}

const getSimilarStories = async (storyId: string) => {
  try {
    const currentStory = await prismadb.story.findUnique({
      where: { id: storyId },
      select: { categories: true }, // Assuming categories is an array of strings
    })

    if (!currentStory || !currentStory.categories.length) return []

    const categoryNames = currentStory.categories.map(
      (category: Category) => category.name
    )

    // Fetch stories that share at least one category
    let similarStories = await prismadb.story.findMany({
      where: {
        id: { not: storyId },
        categories: {
          some: {
            name: { in: categoryNames },
          },
        },
      },
      select: {
        id: true,
        author: true,
        stars: true,
        title: true,
        image: true,
        description: true,
        categories: true,
        createdAt: true,
        views: true,
      },
    })

    // Shuffle results randomly
    similarStories = similarStories.sort(() => Math.random() - 0.5)

    // Return a limited number (e.g., 5) of similar stories
    return similarStories.slice(0, 3)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error("Error fetching similar stories.")
    return []
  }
}

export default StoryPage
