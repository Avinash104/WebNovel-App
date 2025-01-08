import StorySection from "@/app/(home)/component/story-section"
import prismadb from "@/lib/prismadb"
import React from "react"

const HomePage = async () => {
  const stories = await prismadb.story.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      tags: true,
      views: true,
    },
  })

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Public Story Site
        </h1>
        <p className="text-lg text-gray-700">
          Explore stories and dive into chapters.
        </p>
        <div>
          <StorySection stories={stories} />
        </div>
      </div>
    </div>
  )
}

export default HomePage
