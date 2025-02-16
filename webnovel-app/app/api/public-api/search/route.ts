import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = url.searchParams.get("q") || ""
  const categories = url.searchParams.getAll("category")

  console.log("Categories list from serach params: ", categories)

  const stories = await prismadb.story.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } }, // Match title
            { tags: { hasSome: query.split(" ") } }, // Match tags
          ],
        },
        ...(categories.length > 0
          ? categories.map((category) => ({
              categories: { some: { name: category } }, // Ensure each category exists
            }))
          : []),
      ],
    },
    include: {
      categories: true, // Fetch category details
    },
  })

  console.log("Selected stories: ", stories)
  return NextResponse.json(stories)
}
