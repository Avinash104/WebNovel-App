import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  {
    params,
  }: { params: { profileId: string; storeId: string; storeItemId: string } }
) {
  try {
    const user = await currentUser()

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    const { profileId, storeId, storeItemId } = params

    if (!profileId || !storeId || !storeItemId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    // Check if the store belongs to the profile
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId: profileId,
      },
    })

    if (!store) {
      return new NextResponse("No store found for the given profile", {
        status: 404,
      })
    }

    // Check if the store item belongs to the store
    const storeItem = await prismadb.storeItem.findFirst({
      where: {
        id: storeItemId,
        storeId,
      },
    })

    if (!storeItem) {
      return new NextResponse("Store item not found or unauthorized", {
        status: 404,
      })
    }

    // Delete the store item
    await prismadb.storeItem.delete({
      where: {
        id: storeItemId,
      },
    })

    return NextResponse.json({ message: "Store item deleted successfully" })
  } catch (error) {
    console.error("[STORE_ITEMS_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
