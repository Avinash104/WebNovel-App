import ProfileSidebar from "@/app/(home)/components/profile-sidebar"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { profileId: string }
}) {
  const user = await currentUser()
  const profileId = params?.profileId

  if (user) {
    const profile = await prismadb.profile.findUnique({
      where: {
        id: user?.id,
      },
    })
    if (!profile) {
      redirect("/")
    }
  }

  if (user?.id !== profileId) {
    redirect("/")
  }

  return (
    <main className="flex">
      <ProfileSidebar />
      {children}
    </main>
  )
}
