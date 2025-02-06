"use client"

import { StoryWithViews } from "@/lib/utils"
import { StoreItem } from "@prisma/client"
import React from "react"
import StoryCard from "./story-card"

interface ProfileWorksProps {
  stories: StoryWithViews[] | null
  storeItems: StoreItem[] | null
}

const ProfileWorks: React.FC<ProfileWorksProps> = ({ stories, storeItems }) => {
  return (
    <div className="px-4 bg-rose-500">
      <h2 className="my-3 text-3xl font-semibold">Stories</h2>

      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <p>No stories available.</p>
      )}

      <h1>Other Works</h1>
      {storeItems && storeItems.length > 0 ? (
        storeItems.map((item) => <div key={item.id}>{item.title}</div>)
      ) : (
        <p>No Store Items available.</p>
      )}
    </div>
  )
}

export default ProfileWorks
