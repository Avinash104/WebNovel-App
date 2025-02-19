import UsersWorks from "@/app/(home)/components/users-works"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prismadb from "@/lib/prismadb"
import { Profile } from "@prisma/client"
import React from "react"
import CommentSection from "../../components/comment-section"
import UsersFavorites from "../../components/users-favorites"
import MessageSection from "./components/message-section"

interface UserPageProps {
  params: Profile
}

const UserPage: React.FC<UserPageProps> = async ({ params }) => {
  const username = params?.username || ""

  const data = await getUserData(username)
  const { profile, stories, storeItems, comments, favoriteStories } = data

  return (
    <>
      <h2 className="text-2xl my-3 font-semibold px-8 flex items-center justify-between">
        {username} Profile
        <MessageSection receiverId={profile.id} />
      </h2>
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
              <UsersWorks stories={stories} storeItems={storeItems} />
            )}
          </TabsContent>
          <TabsContent value="favs">
            <UsersFavorites favoriteStories={favoriteStories} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

async function getUserData(username: string) {
  // Fetch profile associated with the username
  const profile = await prismadb.profile.findUnique({ where: { username } })

  if (!profile) return { profile: null }

  // Fetch store assocated with the profile
  const store = await prismadb.store.findUnique({
    where: { userId: profile.id },
  })

  // Fetch stories authored by the user if any
  const stories =
    profile.role === "AUTHOR"
      ? await prismadb.story.findMany({ where: { userId: profile.id } })
      : []

  // Fetch all store items in the user store
  const storeItems = store
    ? await prismadb.storeItem.findMany({ where: { storeId: store.id } })
    : []

  // Fetch all the profile wall comments
  const comments = await prismadb.comment.findMany({
    where: { authorId: profile.id, commentType: "PROFILE_WALL" },
    include: { replies: true },
    orderBy: { createdAt: "desc" },
  })

  // Fetch the favorite stories by the user
  const favoriteStories = profile.favoriteStories?.length
    ? await prismadb.story.findMany({
        where: { id: { in: profile.favoriteStories } },
      })
    : []

  return { profile, stories, storeItems, comments, favoriteStories }
}

export default UserPage
