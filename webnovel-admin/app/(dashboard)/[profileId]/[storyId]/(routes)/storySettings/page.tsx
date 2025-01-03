import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "./components/settings-form"

const SettingsPage = async ({
  params,
}: {
  params: { profileId: string; storyId: string }
}) => {
  const user = await currentUser()
  const { storyId } = params

  if (!user?.id) {
    redirect("/sign-in")
  }

  const story = await prismadb.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      categories: true,
    },
  })

  if (!story) {
    redirect("/")
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={story} />
      </div>
    </div>
  )
}

export default SettingsPage
