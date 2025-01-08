import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ProfileSettingsForm from "./components/profile-settings-form"

const SettingsPage = async () => {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  const profile = await prismadb.profile.findUnique({
    where: {
      id: user.id,
    },
    include: {
      paymentLinks: true,
    },
  })

  const numberOfStoriesForProfile = await prismadb.story.count({
    where: {
      userId: user.id,
    },
  })

  if (!profile) {
    redirect("/admin")
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProfileSettingsForm
          initialData={profile}
          numberOfStoriesForProfile={numberOfStoriesForProfile}
        />
      </div>
    </div>
  )
}

export default SettingsPage
