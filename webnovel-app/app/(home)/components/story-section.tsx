"use client"

import { Story } from "@prisma/client"
import Link from "next/link"
import React from "react"
import StoryCard from "./story-card"

interface StorySectionProps {
  stories: Story[]
}
const StorySection: React.FC<StorySectionProps> = ({ stories }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {stories?.map((story) => (
        <Link key={story.id} href={`/stories/${story.id}`}>
          <StoryCard story={story} />
        </Link>
      ))}
    </div>
  )
}

export default StorySection
