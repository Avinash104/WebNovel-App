import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

const toggleFavoriteStory = async (userId: string, storyId: string) => {
  try {
    console.log("user id: ", userId)
    console.log("user storyId: ", storyId)
    const profile = await prismadb.profile.findUnique({
      where: { id: userId },
      select: { favoriteStories: true },
    })

    if (!profile) {
      return new NextResponse("Profile not found.", { status: 403 })
    }

    let updatedFavoriteStories

    // Check if the stroy is already in the favorites
    if (profile.favoriteStories.includes(storyId)) {
      updatedFavoriteStories = profile.favoriteStories.filter(
        (id: string) => id !== storyId
      )
    } else {
      updatedFavoriteStories = [...profile.favoriteStories, storyId]
    }

    const updatedProfile = await prismadb.profile.update({
      where: { id: userId },
      data: { favoriteStories: updatedFavoriteStories },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error toggling favorite story:", error)
    throw error
  }
}

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
    const { username, storyId } = body

    console.log("request body :", body)

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
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

    console.log("profile :", profileByUserId)
    console.log("id :", profileByUserId.id)
    if (storyId) {
      toggleFavoriteStory(profileByUserId.id, storyId)
    }

    console.log("user name update route")
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
