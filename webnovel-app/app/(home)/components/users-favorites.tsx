"use client"

import { Story } from "@prisma/client"
import React from "react"
import StoryCard from "./story-card"

interface UsersFavoritesProps {
  favoriteStories: Story[] | null
  //   storeItems: StoreItem[] | null
}
const UsersFavorites: React.FC<UsersFavoritesProps> = ({ favoriteStories }) => {
  return (
    <div className="px-4 bg-rose-500">
      <h2 className="my-3 text-3xl font-semibold">Stories</h2>

      {favoriteStories && favoriteStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoriteStories &&
            favoriteStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
        </div>
      ) : (
        <p>No stories available.</p>
      )}
    </div>
  )
}

export default UsersFavorites
