"use client"

import { Story } from "@prisma/client"
import React from "react"
import StoryCard from "../../components/story-card"

interface SimilarStoriesProps {
  similarStories: Story[]
}
const SimilarStories: React.FC<SimilarStoriesProps> = ({ similarStories }) => {
  return (
    <>
      <h3 className="text-3xl py-3 font-semibold text-gray-900 dark:text-gray-100">
        Similar Stories
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {similarStories &&
          similarStories?.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
      </div>
    </>
  )
}

export default SimilarStories
