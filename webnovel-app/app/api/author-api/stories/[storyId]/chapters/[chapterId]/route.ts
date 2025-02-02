import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { storyId: string; chapterId: string } }
) {
  try {
    if (!params.storyId) {
      return new NextResponse("Story id is required", { status: 400 })
    }

    if (!params.chapterId) {
      return new NextResponse("Chapter id is required", { status: 400 })
    }

    const chapter = await prismadb.chapter.findUnique({
      where: {
        id: params.chapterId,
        storyId: params.storyId,
      },
      select: {
        title: true,
        content: true,
      },
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.log("[CHAPTER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string; chapterId: string } }
) {
  try {
    const user = await currentUser()

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
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

    const chapter = await prismadb.chapter.findUnique({
      where: {
        id: params.chapterId,
        storyId: params.storyId,
      },
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    const deletedChapter = await prismadb.chapter.delete({
      where: {
        id: params.chapterId,
      },
    })

    //Adjust the sequence of the chapters after deleting a chapter
    if (chapter.sequence < chapterCount) {
      await prismadb.chapter.updateMany({
        where: {
          sequence: {
            gt: chapter.sequence,
          },
          storyId: params.storyId,
        },
        data: {
          sequence: {
            decrement: 1,
          },
        },
      })
    }

    return NextResponse.json(deletedChapter)
  } catch (error) {
    console.log("[CHAPTER_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string; chapterId: string } }
) {
  try {
    const user = await currentUser()

    const body = await req.json()

    const { published, title, content } = body

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!params.storyId) {
      return new NextResponse("Story id is required", { status: 400 })
    }

    if (!params.chapterId) {
      return new NextResponse("Chapter id is required", { status: 400 })
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

    let chapter

    if (published !== undefined) {
      // Handle the `isPublished` update
      chapter = await prismadb.chapter.update({
        where: {
          id: params.chapterId,
        },
        data: {
          published,
        },
      })
    } else {
      // Handle the title or content update
      chapter = await prismadb.chapter.update({
        where: {
          id: params.chapterId,
        },
        data: {
          title,
          content,
        },
      })
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.log("[CHAPTER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
