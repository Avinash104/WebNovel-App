import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server" // Function to get logged-in user
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const { storyId, rating } = await req.json()

    if (rating < 0 || rating > 5) {
      return new NextResponse("Invalid rating. Must be between 0 and 5.", {
        status: 400,
      })
    }

    // Check if the user has already rated the story
    const existingRating = await prismadb.storyRating.findUnique({
      where: {
        userId_storyId: { userId: user.id, storyId },
      },
    })

    if (existingRating) {
      // Update existing rating
      await prismadb.storyRating.update({
        where: { id: existingRating.id },
        data: { rating },
      })
    } else {
      // Create new rating
      await prismadb.storyRating.create({
        data: {
          userId: user.id,
          storyId,
          rating,
        },
      })
    }

    // Recalculate the average rating
    const { _avg } = await prismadb.storyRating.aggregate({
      where: { storyId },
      _avg: { rating: true },
    })

    await prismadb.story.update({
      where: { id: storyId },
      data: { stars: _avg.rating || 0 },
    })

    return NextResponse.json({ success: true, newRating: _avg.rating || 0 })
  } catch (error) {
    console.error("[RATE_STORY_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
