// import { useParams } from "next/navigation"

// const stories = {
//   "1": { title: "Story One", chapters: ["Chapter 1", "Chapter 2"] },
//   "2": { title: "Story Two", chapters: ["Chapter A", "Chapter B"] },
// }

// export default function StoryPage({ params }: { params: { id: string } }) {
//   const story = stories[params.id]

//   if (!story) {
//     return notFound()
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
//       <h2 className="text-xl font-semibold mb-2">Chapters</h2>
//       <ul className="space-y-2">
//         {story.chapters.map((chapter, index) => (
//           <li key={index} className="text-gray-700">
//             {chapter}
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

import prismadb from "@/lib/prismadb"
import { Chapter } from "@prisma/client"
import Link from "next/link"
import React from "react"

const StoryPage = async ({ params }: { params: { storyId: string } }) => {
  const storyId = params?.storyId
  console.log(storyId)
  const story = await prismadb.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      chapters: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  return (
    <div>
      {story && (
        <div>
          {story.chapters.map((chapter: Chapter) => (
            <div key={chapter.id}>
              <Link href={`/stories/${storyId}/${chapter.id}`}>
                {chapter.title}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StoryPage
