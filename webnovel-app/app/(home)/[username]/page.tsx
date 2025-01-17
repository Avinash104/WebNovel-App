import ProfileWorks from "@/app/(home)/components/profile-works"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prismadb from "@/lib/prismadb"
import { Profile } from "@prisma/client"
import React from "react"

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

  const store = await prismadb.store.findUnique({
    where: {
      profileId: profile.id,
    },
  })

  let stories
  let storeItems

  if (profile.role === "AUTHOR") {
    stories = await prismadb.story.findMany({
      where: {
        userId: profile.id,
      },
    })

    storeItems = await prismadb.storeItem.findMany({
      where: {
        storeId: store.id,
      },
    })
  }
  return (
    <div className="flex items-center justify-center">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="account">Profile Wall</TabsTrigger>
          {profile.role === "AUTHOR" && (
            <TabsTrigger value="password">Works</TabsTrigger>
          )}
          <TabsTrigger value="favs">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">
          <ProfileWorks stories={stories} storeItems={storeItems} />
        </TabsContent>
        <TabsContent value="favs">Change your nothing here.</TabsContent>
      </Tabs>
    </div>
  )
}

export default UserPage
