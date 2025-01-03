import { createNewProfile } from "@/lib/create-new-profile"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  let profile = await prismadb.profile.findUnique({
    where: {
      id: user?.id,
    },
  })

  const story = await prismadb.story.findFirst({
    where: {
      userId: user?.id,
    },
  })

  if (profile && story) {
    redirect(`/${profile.id}/${story.id}`)
  }

  if (!profile || !profile.name) {
    await createNewProfile(user?.id as string)
    profile = await prismadb.profile.findUnique({
      where: {
        id: user?.id,
      },
    })
    redirect(`/${profile.id}/setup`)
  }

  if (profile && !story) {
    redirect(`/${profile.id}/story`)
  }

  return <>{children}</>
}
