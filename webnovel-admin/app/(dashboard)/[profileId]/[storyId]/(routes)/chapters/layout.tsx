import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { storyId: string }
}) {
  const user = await currentUser()
  const { storyId } = params

  if (!user?.id) {
    redirect("/sign-in")
  }

  const story = await prismadb.story.findUnique({
    where: {
      id: storyId,
    },
  })

  if (!story) {
    redirect("/")
  }

  return <div className="w-full">{children}</div>
}
