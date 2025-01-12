import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { MembershipLevel } from "@prisma/client"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      tags,
      image,
      categories,
      subscriptionAllowed,
      membershipLevels,
    } = body

    // Basic validations
    if (!title || !description || !tags?.length) {
      return new NextResponse("Invalid input data", { status: 400 })
    }

    if (!params.storyId) {
      return new NextResponse("Story ID is required", { status: 400 })
    }

    // Check story ownership
    const storyByUserId = await prismadb.story.findUnique({
      where: { id: params.storyId },
    })

    if (!storyByUserId || storyByUserId.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Prepare categories update logic
    const categoryUpdates =
      categories && categories.length > 0
        ? {
            categories: {
              set: categories.map((id: string) => ({ id })), // Update categories
            },
          }
        : {
            categories: {
              set: [], // Clear categories if none provided
            },
          }

    const membershipLevelsUpdates =
      membershipLevels && membershipLevels.length > 0
        ? {
            membershipLevels: {
              deleteMany: {},
              create: membershipLevels.map((level: MembershipLevel) => ({
                title: level.title,
                chaptersLocked: level.chaptersLocked,
                price: level.price,
              })),
            },
          }
        : {
            membershipLevels: {
              deleteMany: {},
            },
          }

    const updatedStory = await prismadb.story.update({
      where: { id: params.storyId },
      data: {
        title,
        description,
        tags,
        image,
        subscriptionAllowed,
        ...categoryUpdates,
        ...membershipLevelsUpdates,
      },
    })

    return NextResponse.json(updatedStory)
  } catch (error) {
    console.error("[STORY_PATCH_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
      redirect("/sign-in")
    }

    if (!user.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!params.storyId) {
      return new NextResponse("Story id is required", { status: 400 })
    }

    const storyByUserId = await prismadb.story.findFirst({
      where: {
        id: params.storyId,
        userId: user.id,
      },
    })

    if (!storyByUserId) {
      return new NextResponse("Story not found or unauthorized", {
        status: 404,
      })
    }

    // Delete all related chapters first before deleting the story
    await prismadb.chapter.deleteMany({
      where: {
        storyId: params.storyId,
      },
    })

    const story = await prismadb.story.delete({
      where: {
        id: params.storyId,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.log("[STORY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET({ params }: { params: { storyId: string } }) {
  try {
    const story = await prismadb.story.findUnique({
      where: {
        id: params.storyId,
      },
      select: {
        membershipLevels: true,
      },
    })
    return NextResponse.json(story)
  } catch (error) {
    console.error("[GET_STORY_MEMBERSHIP_LEVELS_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
