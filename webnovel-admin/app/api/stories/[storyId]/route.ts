import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
      redirect("/sign-in")
    }

    const body = await req.json()
    const {
      name,
      description,
      tags,
      image,
      categories,
      subscriptionAllowed,
      subscriptionPrice,
      numberOfLockedChapters,
    } = body

    if (!user.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 })
    }

    if (!tags?.length) {
      return new NextResponse("Tags are required", { status: 400 })
    }

    if (!params.storyId) {
      return new NextResponse("Story ID is required", { status: 400 })
    }

    const storyByUserId = await prismadb.story.findUnique({
      where: {
        id: params.storyId,
      },
    })

    if (!storyByUserId || storyByUserId.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    let categoryUpdates = {}
    if (categories && categories.length > 0) {
      categoryUpdates = {
        categories: {
          set: categories.map((id: string) => ({ id })), // Disconnect all existing relations and connect the provided IDs
        },
      }
    } else {
      categoryUpdates = {
        categories: {
          set: [], // Clear all existing relations if no categories are provided
        },
      }
    }

    const story = await prismadb.story.update({
      where: {
        id: params.storyId,
      },
      data: {
        name,
        description,
        tags,
        image,
        subscriptionAllowed,
        subscriptionPrice,
        numberOfLockedChapters,
        ...categoryUpdates,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.error("[STORY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
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

    const story = await prismadb.story.delete({
      where: {
        id: params.storyId,
        userId: user.id,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.log("[STORY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
