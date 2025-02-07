import ProfileWorks from "@/app/(home)/components/profile-works"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prismadb from "@/lib/prismadb"
import { Profile, Story } from "@prisma/client"
import React from "react"
import CommentSection from "../../components/comment-section"

interface UserPageProps {
  params: Profile
}
const UserPage: React.FC<UserPageProps> = async ({ params }) => {
  const username = params?.username

  const profile = await prismadb.profile.findUnique({
    where: {
      username,
    },
  })

  let store
  let stories: Story[] = []
  let storeItems
  let comments

  if (profile) {
    store = await prismadb.store.findUnique({
      where: {
        userId: profile.id,
      },
    })

    if (profile.role === "AUTHOR") {
      stories = await prismadb.story.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          author: true,
          image: true,
          stars: true,
          tags: true,
          userId: true,
          createdAt: true,
          views: true,
        },
      })

      storeItems = await prismadb.storeItem.findMany({
        where: {
          storeId: store.id,
        },
      })
    }

    comments = await prismadb.comment.findMany({
      where: {
        authorId: profile.id,
        commentType: "PROFILE_WALL",
      },
      include: {
        replies: true, // Ensure replies are included
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  return (
    <>
      <h2 className="text-2xl my-3 font-semibold px-3">{username} Profile</h2>
      <div className="flex items-center justify-center">
        <Tabs defaultValue="profileWall" className="w-full">
          <TabsList className="w-full h-12">
            <TabsTrigger value="profileWall">
              {" "}
              <p className="text-xl">Profile Wall</p>
            </TabsTrigger>
            {profile?.role === "AUTHOR" && (
              <TabsTrigger value="works">
                {" "}
                <p className="text-xl"> Works</p>
              </TabsTrigger>
            )}
            <TabsTrigger value="favs">
              <p className="text-xl"> Favorites</p>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profileWall">
            <CommentSection comments={comments} authorId={profile?.id} />
          </TabsContent>
          <TabsContent value="works">
            {stories.length > 0 && (
              <ProfileWorks stories={stories} storeItems={storeItems} />
            )}
          </TabsContent>
          <TabsContent value="favs">Change your nothing here.</TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default UserPage
