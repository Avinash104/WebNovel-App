import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { userId, storyId, selectedLevel, isAutoRenewOn, period } = body

    if (!userId || userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }
    if (!storyId) {
      return new NextResponse("Story ID is required", { status: 400 })
    }
    if (!selectedLevel) {
      return new NextResponse("Invalid membership level", { status: 400 })
    }

    const validMembershipLevel = await prismadb.membershipLevel.findUnique({
      where: { id: selectedLevel },
    })
    if (!validMembershipLevel) {
      return new NextResponse("Invalid membership level ID", { status: 400 })
    }

    const getExpirationDate = (period: string): Date => {
      const now = new Date()
      switch (period) {
        case "MONTHLY":
          now.setMonth(now.getMonth() + 1)
          break
        case "QUARTERLY":
          now.setMonth(now.getMonth() + 3)
          break
        case "HALFYEARLY":
          now.setMonth(now.getMonth() + 6)
          break
        default:
          throw new Error(`Invalid membership period: ${period}`)
      }
      return now
    }

    const expiresAt = getExpirationDate(period)

    const existingMembership = await prismadb.membership.findUnique({
      where: {
        userId_storyId: {
          userId: userId,
          storyId: storyId,
        },
      },
    })

    let membership

    if (!existingMembership) {
      membership = await prismadb.membership.create({
        data: {
          userId,
          storyId,
          membershipLevelId: selectedLevel,
          autoRenew: isAutoRenewOn,
          membershipPeriod: period,
          expiresAt,
        },
      })
      return NextResponse.json(membership, { status: 201 })
    }

    membership = await prismadb.membership.update({
      where: {
        userId_storyId: {
          userId: userId,
          storyId: storyId,
        },
      },
      data: {
        membershipLevelId: selectedLevel,
        autoRenew: isAutoRenewOn,
        membershipPeriod: period,
        expiresAt,
      },
    })

    return NextResponse.json(membership, { status: 200 })
  } catch (error) {
    console.error("[MEMBERSHIP_POST_ERROR]", error.message)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
