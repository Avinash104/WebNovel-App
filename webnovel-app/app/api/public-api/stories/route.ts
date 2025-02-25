import prismadb from "@/lib/prismadb"
import { Story } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stories: Story[] = await prismadb.story.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        author: true,
        image: true,
        stars: true,
        tags: true,
        userId: true,
        createdAt: true,
        views: true,
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error("[GET_PUBLIC_STORIES_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
