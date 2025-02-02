import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { chapterId } = params
    if (!chapterId) {
      return new NextResponse("Chapter ID is required", { status: 400 })
    }

    const user = await currentUser()
    const userId = user?.id || null
    const cookieStore = cookies()

    // **1. Prevent duplicate views for guests using cookies**
    const guestViewKey = `viewed_chapter_${chapterId}`
    const hasViewed = cookieStore.get(guestViewKey)

    if (!userId && hasViewed) {
      return new NextResponse("Already counted for guest", { status: 200 }) // Ignore duplicate guest views
    }

    // **2. Prevent duplicate views for logged-in users**
    if (userId) {
      const existingView = await prismadb.viewLog.findFirst({
        where: { userId, chapterId },
      })
      if (existingView) {
        return new NextResponse("Already counted for user", { status: 200 })
      }
    }

    // **3. Update chapter view count**
    await prismadb.chapter.update({
      where: { id: chapterId },
      data: { views: { increment: 1 } },
    })

    // **4. Store guest view in cookies (expires in 1 hour)**
    if (!userId) {
      cookieStore.set(guestViewKey, "true", { maxAge: 3600 })
    }

    // **5. Store user view in `ViewLog` to prevent duplicate views**
    if (userId) {
      await prismadb.viewLog.create({
        data: {
          userId,
          chapterId,
        },
      })
    }

    return new NextResponse("View counted", { status: 200 })
  } catch (error) {
    console.error("[CHAPTER_VIEW_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
