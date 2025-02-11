"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Story } from "@prisma/client"
import Image from "next/image"
import StarRating from "../stories/component/star-rating"

interface StoryCardProps {
  story: Story
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <div
      key={story.id}
      className="bg-red-400 rounded-lg shadow-lg p-4 hover:shadow-xl transition transform max-h-[400px] hover:bg-red-300"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h4 className="font-bold"> {story.title}</h4>
          </CardTitle>
          <CardDescription>
            {" "}
            {story?.image ? (
              <div className="h-full rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  className="object-cover"
                  width={150}
                  height={150}
                  alt={story.title ? "" : "Story Cover"}
                  src={story.image}
                />
              </div>
            ) : (
              <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center border border-gray-300">
                <span className="text-gray-500 text-sm">No Thumbnail</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Author  */}
          {/* Link inside Link tag caused hydration errors. Will fix this issue later. Removed link to author profile for now. */}

          {/* <Link href={`/users/${story.author}`} className="flex"> */}
          <div className="flex">
            <span className="mr-1 font-semibold">By </span>
            <span className="font-bold text-sky-400 hover:underline">
              {" "}
              {story.author}
            </span>
          </div>
          {/* </Link> */}

          {/* Story Ratings */}
          <StarRating storyId={story.id} currentRating={story.stars} />

          {/* Story Tags  */}
          {story?.tags?.map((tag, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-600 mx-1 px-2 py-1 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </CardContent>
        <CardFooter>
          <div className="w-full flex items-center justify-between font-semibold">
            <p>{new Date(story.createdAt).toLocaleDateString("en-US")}</p>
            <p className=""> Views {story.views}</p>
          </div>
        </CardFooter>
      </Card>
      <div className="h-48 w-full mb-4"></div>
    </div>
  )
}

export default StoryCard
