import prismadb from "@/lib/prismadb"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { storyId: string }
}) {
  const { storyId } = params

  const story = await prismadb.story.findUnique({
    where: {
      id: storyId,
    },
  })

  if (!story) {
    redirect("/admin")
  }

  return <div className="w-full">{children}</div>
}
