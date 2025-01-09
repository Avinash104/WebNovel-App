import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const user = await currentUser()

    const body = await req.json()

    const { username } = body

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!username) {
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
        username,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.log("[PROFILE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE({ params }: { params: { profileId: string } }) {
  try {
    const user = await currentUser()

    const { profileId } = params

    if (!user) {
      redirect("/sign-in")
    }

    if (!user.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const profileByUserId = prismadb.profile.delete({
      where: {
        id: params.profileId,
      },
    })

    if (!profileByUserId) {
      return new NextResponse("No profile found for this user id.")
    }

    // Delete all related payment links first before deleting the profile
    await prismadb.paymentLinks.deleteMany({
      where: {
        userId: params.profileId,
      },
    })

    const profile = await prismadb.profile.delete({
      where: {
        id: profileId,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.log("[PROFILE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
