import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: { membershipId: string } }
) {
  try {
    const user = await currentUser()
    const membershipId = params?.membershipId

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const membershipById = await prismadb.membership.findUnique({
      where: {
        id: membershipId,
        userId: user.id,
      },
    })

    if (!membershipById) {
      return new NextResponse("No membership found.", { status: 405 })
    }

    const deletedMembership = await prismadb.membership.delete({
      where: {
        id: membershipId,
      },
    })

    return NextResponse.json(deletedMembership)
  } catch (error) {
    console.log("[MEMBERSHIP_DELETE_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
