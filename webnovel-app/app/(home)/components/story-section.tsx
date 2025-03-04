"use client"

import { Story } from "@prisma/client"
import React from "react"
import StoryCard from "./story-card"

interface StorySectionProps {
  stories: Story[]
}
const StorySection: React.FC<StorySectionProps> = ({ stories }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {stories?.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}

export default StorySection
