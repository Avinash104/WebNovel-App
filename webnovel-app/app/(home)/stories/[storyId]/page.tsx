import CommentSection from "@/app/(home)/components/comment-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { Profile } from "@prisma/client"
import React from "react"
import PublicChapterList from "../component/public-chapter-list"
import ReviewSection from "../component/review-section"
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
        <Tabs defaultValue="reviews" className="w-full">
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
                userHasHundredComments={userHasHundredComments}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <CommentSection comments={comments} storyId={storyId} />
      </div>
    </>
  )
}

export default StoryPage
