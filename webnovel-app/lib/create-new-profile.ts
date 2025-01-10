import prismadb from "@/lib/prismadb"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export async function createNewProfile(userId: string) {
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

export async function createNewAuthorProfile(userId: string) {
  const existingProfile = await prismadb.profile.findUnique({
    where: { id: userId },
  })

  if (!existingProfile) {
    redirect("/sign-in")
  }

  await prismadb.profile.update({
    where: {
      id: userId,
    },
    data: {
      role: Role.AUTHOR,
    },
  })
}
