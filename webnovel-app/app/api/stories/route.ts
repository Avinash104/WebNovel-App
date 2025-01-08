import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      redirect("/sign-in")
    }
    const body = await req.json()

    const { name, description, tags } = body

    if (!user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 })
    }

    if (!tags) {
      return new NextResponse("Tags are required", { status: 400 })
    }

    const story = await prismadb.story.create({
      data: {
        name,
        description,
        tags,
        userId: user.id,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.log("[STORY_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
