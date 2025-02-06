import prismadb from "@/lib/prismadb"
import { StoryWithViews } from "@/lib/utils" // Import your extended type
import { Story } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stories: StoryWithViews[] = await Promise.all(
      (
        await prismadb.story.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            tags: true,
            userId: true,
            createdAt: true,
          },
        })
      ).map(async (story: Story) => {
        const totalViewsData = await prismadb.chapter.aggregate({
          where: { storyId: story.id, published: true },
          _sum: { views: true },
        })

        console.log("story profile", story.userId)

        const author = await prismadb.profile.findUnique({
          where: { id: story.userId },
        })

        return {
          ...story,
          totalViews: totalViewsData._sum.views || 0, // Ensure it's always a number
          author: author.username,
        }
      })
    )

    return NextResponse.json(stories)
  } catch (error) {
    console.error("[GET_STORIES_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
