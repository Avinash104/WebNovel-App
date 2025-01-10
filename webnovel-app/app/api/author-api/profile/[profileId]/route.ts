import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

//there is an issue with Patch..
//if we try to serch for a profile with the dynamic profile id frm the params
//it runs into error because profileId comes as 'undefined'
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
        id: user.id,
      },
    })

    if (!profileByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const profile = await prismadb.profile.update({
      where: {
        id: profileByUserId.id,
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

export async function GET(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const profileId = params?.profileId

    if (!profileId) {
      return new NextResponse("Profile ID is required", { status: 400 })
    }

    const profile = await prismadb.profile.findUnique({
      where: {
        id: profileId,
      },
    })

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[GET_PROFILE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
