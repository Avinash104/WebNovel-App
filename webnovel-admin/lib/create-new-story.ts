import prismadb from "@/lib/prismadb"

export async function createNewStory(userId: string) {
  await prismadb.story.create({
    data: {
      userId,
    },
  })
}
