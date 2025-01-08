import prismadb from "@/lib/prismadb"
import React from "react"

const StoryPage = async ({ params }: { params: { chapterId: string } }) => {
  const chapterId = params?.chapterId
  const chapter = await prismadb.chapter.findUnique({
    where: {
      id: chapterId,
    },
  })

  return (
    <div>
      <h3> {chapter.title}</h3>
      <p
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
    </div>
  )
}

export default StoryPage
