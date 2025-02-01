"use client"

import { StoreItem, Story } from "@prisma/client"
import React from "react"

interface ProfileWorksProps {
  stories: Story[] | null
  storeItems: StoreItem[] | null
}

const ProfileWorks: React.FC<ProfileWorksProps> = ({ stories, storeItems }) => {
  return (
    <div>
      <h1> Stories</h1>
      {stories && stories.length > 0 ? (
        stories.map((story) => <div key={story.id}>{story.title}</div>)
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
