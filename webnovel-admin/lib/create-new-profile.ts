import prismadb from "@/lib/prismadb"
import { redirect } from "next/navigation"

export async function createNewProfile(userId: string) {
  const existingProfile = await prismadb.profile.findUnique({
    where: { id: userId },
  })

  if (!existingProfile) {
    await prismadb.profile.create({
      data: {
        id: userId, // Use Clerk's userId as Profile ID
      },
    })
  }

  const profile = await prismadb.profile.findUnique({
    where: {
      id: userId,
    },
  })
  redirect(`/${profile.id}/setup`)
}
