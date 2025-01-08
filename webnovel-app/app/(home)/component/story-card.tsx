"use client"

import { Story } from "@prisma/client"
import Image from "next/image"

interface StoryCardProps {
  story: Story
}
const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <div
      key={story.id}
      className="border rounded-lg shadow-lg p-4 hover:shadow-xl transition transform hover:scale-105"
    >
      <div className="h-48 w-full mb-4">
        {story.image ? (
          <div className="h-full w-full rounded-md overflow-hidden">
            <Image
              className="object-cover"
              width={200}
              height={200}
              alt={story.name ? "" : "Story Cover"}
              src={story.image}
            />
          </div>
        ) : (
          <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center border border-gray-300">
            <span className="text-gray-500 text-sm">No Thumbnail</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
          {story.name}
        </h3>
        {/* <p className="text-gray-600 text-sm mb-4">
          {story.description?.length > 100 ? (
            <>
              {story.description?.slice(0, 100)}...
              <Button
                onClick={() => alert("Show full description")}
                className="text-primary hover:underline ml-1"
              >
                Read more
              </Button>
            </>
          ) : (
            story.description
          )}
        </p>
        <div className="text-primary font-bold text-lg mb-2">
          ${story.price.toFixed(2)}
        </div> */}
      </div>
    </div>
  )
}

export default StoryCard
