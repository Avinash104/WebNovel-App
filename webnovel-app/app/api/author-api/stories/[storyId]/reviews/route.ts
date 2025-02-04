import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    console.log("Inside reviews GET")
    const user = await currentUser()
    const storyId = params?.storyId

    console.log("Story id: ", storyId)

    if (!user) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }
    console.log("user id: ", user.id)

    const profileByUser = await prismadb.profile.findUnique({
      where: { id: user.id },
    })

    console.log("profile: ", profileByUser)
    if (!profileByUser) {
      return new NextResponse("Profile is missing for the user", {
        status: 400,
      })
    }

    const existingReview = await prismadb.review.findUnique({
      where: { storyId_userId: { storyId: storyId, userId: profileByUser.id } },
    })

    return NextResponse.json(existingReview)
  } catch (error) {
    console.error("[GET_REVIEW_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const user = await currentUser()

    if (!user) {
      redirect("/sign-in")
    }

    const storyId = params?.storyId
    const body = await req.json()

    const { summary, content } = body

    if (!user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (!summary) {
      return new NextResponse("Summary is required", { status: 400 })
    }

    if (!content) {
      return new NextResponse("Content is required", { status: 400 })
    }

    const profileByUser = await prismadb.profile.findUnique({
      where: { id: user.id },
    })

    console.log("profile: ", profileByUser)
    if (!profileByUser) {
      return new NextResponse("Profile is missing for the user", {
        status: 400,
      })
    }

    // Check if a review already exists by this user on this story
    const existingReview = await prismadb.review.findUnique({
      where: { storyId_userId: { storyId, userId: profileByUser.id } },
    })
    console.log("existing :", existingReview)

    if (!existingReview) {
      console.log("inside new review")
      const review = await prismadb.review.create({
        data: {
          summary,
          content,
          poster: profileByUser.username,
          userId: profileByUser.id,
          storyId,
        },
      })
      return NextResponse.json(review)
    }

    return NextResponse.json({
      message:
        "You already have a review for this story. You can edit it from your profile menu.",
    })
  } catch (error) {
    console.log("[REVIEW_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
