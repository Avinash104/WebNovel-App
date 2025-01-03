import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const user = await currentUser()
    const body = await req.json()

    const { title, content } = body

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!content) {
      return new NextResponse("Content can't be empty!!", { status: 400 })
    }

    if (!params.storyId) {
      return new NextResponse("Story id is required", { status: 400 })
    }

    const storyByUserId = await prismadb.story.findUnique({
      where: {
        id: params.storyId,
        userId: user.id,
      },
    })

    if (!storyByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const chapterCount = await prismadb.chapter.count({
      where: {
        storyId: params.storyId,
      },
    })

    const chapter = await prismadb.chapter.create({
      data: {
        title,
        content,
        storyId: params.storyId,
        sequence: chapterCount + 1,
      },
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.log("[CHAPTERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    if (!params.storyId) {
      return new NextResponse("Story id is required", { status: 400 })
    }

    const chapters = await prismadb.chapter.findMany({
      where: {
        storyId: params.storyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(chapters)
  } catch (error) {
    console.log("[CHAPTERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
