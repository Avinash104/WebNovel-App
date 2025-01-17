import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("We are inside api route")
    const stories = await prismadb.story.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        tags: true,
      },
    })
    return NextResponse.json(stories)
  } catch (error) {
    console.error("[GET_STORIES_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
