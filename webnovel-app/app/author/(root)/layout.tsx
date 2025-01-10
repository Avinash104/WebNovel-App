import { createNewAuthorProfile } from "@/lib/create-new-profile"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { Role } from "@prisma/client"
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

  const profile = await prismadb.profile.findUnique({
    where: {
      id: user?.id,
    },
  })

  if (profile.role !== Role.AUTHOR) {
    await createNewAuthorProfile(user?.id as string)
  }

  const story = await prismadb.story.findFirst({
    where: {
      userId: user?.id,
    },
  })

  if (profile && story) {
    redirect(`/author/${profile.id}/${story.id}/chapters`)
  }

  if (profile && !story) {
    redirect(`/author/${profile.id}/story`)
  }

  return <>{children}</>
}
