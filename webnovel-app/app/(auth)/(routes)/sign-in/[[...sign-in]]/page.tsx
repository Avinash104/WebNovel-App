import prismadb from "@/lib/prismadb"
import { SignIn } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"

export default async function Page() {
  const user = await currentUser()
  const createNewProfile = async (userId: string) => {
    const existingProfile = await prismadb.profile.findUnique({
      where: { id: userId },
    })

    if (!existingProfile) {
      await prismadb.profile.create({
        data: {
          id: userId,
        },
      })
    }
  }

  createNewProfile(user?.id as string)

  return <SignIn />
}
