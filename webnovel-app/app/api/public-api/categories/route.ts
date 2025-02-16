import prismadb from "@/lib/prismadb"
import { Category } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories: Category[] = await prismadb.category.findMany()

    console.log("categories: ", categories)
    return NextResponse.json(categories)
  } catch (error) {
    console.error("[GET_PUBLIC_CATEGORIES_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
