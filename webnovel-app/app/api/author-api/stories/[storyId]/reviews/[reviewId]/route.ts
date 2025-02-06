import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string; reviewId: string } }
) {
  try {
    console.log("Inside patchin review")
    const user = await currentUser()
    const storyId = params?.storyId
    const reviewId = params?.reviewId

    if (!user) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }
    console.log("user id: ", user.id)

    const body = await req.json()
    const { summary, content } = body

    // Basic validations
    if (!summary || !content) {
      return new NextResponse("Invalid input data", { status: 400 })
    }

    console.log("summary and content :", summary, content)

    if (!storyId || !reviewId) {
      return new NextResponse("Story Id and Review Id is required", {
        status: 400,
      })
    }

    const existingReview = await prismadb.review.findUnique({
      where: { id: reviewId },
    })

    console.log("existing review: ", existingReview)

    // Check review ownership
    if (!existingReview || existingReview.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Update story
    const updatedReview = await prismadb.review.update({
      where: { id: reviewId },
      data: {
        summary,
        content,
      },
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("[REVIEW_PATCH_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string; reviewId: string } }
) {
  try {
    const user = await currentUser()
    const storyId = params?.storyId
    const reviewId = params?.reviewId

    if (!user) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!storyId || !reviewId) {
      return new NextResponse("Story and review ids are required.", {
        status: 400,
      })
    }

    // check if profile exists for the user
    const profileByUserId = await prismadb.profile.findUnique({
      where: { id: user.id },
    })

    if (!profileByUserId) {
      return new NextResponse("No profile exists.", {
        status: 400,
      })
    }

    // Check authority to delete
    const existingReview = await prismadb.review.findUnique({
      where: { storyId_userId: { storyId, userId: profileByUserId.id } },
    })

    console.log("existing review: ", existingReview)

    // Check review ownership
    if (
      !existingReview ||
      existingReview.userId !== profileByUserId.id ||
      existingReview.id !== reviewId
    ) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Delete the review
    const review = await prismadb.review.delete({
      where: {
        id: reviewId,
        userId: profileByUserId.id,
        storyId,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.log("[STORY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
