import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const user = await currentUser()

    const body = await req.json()

    const { name } = body

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!params.profileId) {
      return new NextResponse("Profile id is required", { status: 400 })
    }

    const profileByUserId = await prismadb.profile.findUnique({
      where: {
        id: params.profileId,
      },
    })

    if (!profileByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const profile = await prismadb.profile.update({
      where: {
        id: params.profileId,
      },
      data: {
        name,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
