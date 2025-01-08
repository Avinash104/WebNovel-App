import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params
    const user = await currentUser()
    const body = await req.json()

    const { title, description, price, pdfLink, thumbnail } = body

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 })
    }

    if (!price) {
      return new NextResponse("Price field can't be empty", { status: 400 })
    }

    if (!pdfLink) {
      return new NextResponse("Pdf file is required", { status: 400 })
    }

    if (!params.profileId) {
      return new NextResponse("Profile id is required", { status: 400 })
    }

    const storeByProfileId = await prismadb.store.findUnique({
      where: {
        profileId,
      },
    })

    if (!storeByProfileId) {
      await prismadb.store.create({
        data: {
          profileId,
        },
      })
    }

    //If store exists under the profile, add the store item
    const storeItem = await prismadb.storeItem.create({
      data: {
        title,
        description,
        price,
        pdfLink,
        thumbnail,
        storeId: storeByProfileId.id,
      },
    })

    return NextResponse.json(storeItem)
  } catch (error) {
    console.log("[STORE_ITEM_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const user = await currentUser()

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const profileId = params?.profileId
    if (!profileId) {
      return new NextResponse("Profile id is required", { status: 400 })
    }

    const storeByProfileId = await prismadb.store.findUnique({
      where: {
        profileId,
      },
    })

    if (!storeByProfileId) {
      return NextResponse.json([], { status: 200 })
    }

    const storeItems = await prismadb.storeItem.findMany({
      where: {
        storeId: storeByProfileId.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(storeItems)
  } catch (error) {
    console.error("[STORE_ITEMS_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
