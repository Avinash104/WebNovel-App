import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      redirect("/sign-in")
    }

    //get all categories
    const tags = await prismadb.category.findMany()

    return NextResponse.json(tags)
  } catch (error) {
    console.log("[CATEGORIES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
