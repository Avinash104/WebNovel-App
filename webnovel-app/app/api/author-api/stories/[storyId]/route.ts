import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { MembershipLevel } from "@prisma/client"
import isEqual from "lodash/isEqual"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

const updateMembershipLevels = async (
  storyId: string,
  membershipLevels: MembershipLevel[]
) => {
  console.log("If no membership levels are provided, clear them")
  if (!membershipLevels || membershipLevels.length === 0) {
    // If no membership levels are provided, clear them
    await prismadb.membershipLevel.deleteMany({
      where: { storyId },
    })
    return
  }

  // Fetch existing membership levels for this story
  console.log("Fetch existing membership levels for this story")
  const existingLevels = await prismadb.membershipLevel.findMany({
    where: { storyId },
    select: {
      title: true,
      chaptersLocked: true,
      price: true,
    },
  })

  console.log("compare the coming membership level with existing")
  console.log("membership Levels is", membershipLevels)
  console.log("existing Levels is", existingLevels)
  if (isEqual(membershipLevels, existingLevels)) {
    membershipLevels = []
    return
  }

  // Prepare update/create/delete operations
  console.log("Prepare update/create/delete operation")

  const levelsToUpdate = membershipLevels.filter((level) =>
    existingLevels.some(
      (existing: MembershipLevel) => existing.title === level.title
    )
  )
  const levelsToCreate = membershipLevels.filter(
    (level) =>
      !existingLevels.some(
        (existing: MembershipLevel) => existing.title === level.title
      )
  )
  const levelsToDelete = existingLevels
    .filter(
      (existing: MembershipLevel) =>
        !membershipLevels.some((level) => existing.title === level.title)
    )
    .map((level: MembershipLevel) => level.title)

  console.log("levels to update", levelsToUpdate)
  console.log("levels to create", levelsToCreate)
  console.log("levels to delete", levelsToDelete)

  // Perform database operations
  await Promise.all([
    // Update existing levels
    ...levelsToUpdate.map((level) =>
      prismadb.membershipLevel.update({
        where: { storyId_title: { storyId, title: level.title } },
        data: {
          title: level.title,
          chaptersLocked: level.chaptersLocked,
          price: level.price,
        },
      })
    ),
    // Create new levels
    prismadb.membershipLevel.createMany({
      data: levelsToCreate.map((level) => ({
        title: level.title,
        chaptersLocked: level.chaptersLocked,
        price: level.price,
        storyId,
      })),
    }),
    // Delete removed levels (handle memberships if necessary)
    prismadb.membershipLevel.deleteMany({
      where: { storyId, title: { in: levelsToDelete } },
    }),
  ])
}

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

    // Update membership levels if provided
    if (membershipLevels) {
      await updateMembershipLevels(params.storyId, membershipLevels)
    }

    // Update story
    const updatedStory = await prismadb.story.update({
      where: { id: params.storyId },
      data: {
        title,
        description,
        tags,
        image,
        subscriptionAllowed,
        ...categoryUpdates,
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
