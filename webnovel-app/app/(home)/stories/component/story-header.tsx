"use client"

import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { useSubscriptionModal } from "@/hooks/use-subscription-modal"
import { useUser } from "@clerk/nextjs"
import { Category, Membership, MembershipLevel } from "@prisma/client"
import Image from "next/image"
import React, { useState } from "react"
import { toast } from "react-hot-toast"

type Story = {
  title: string
  description: string
  image?: string
  tags: string[]
  views: number
  categories?: Category[]
  subscriptionAllowed: boolean
  membershipLevels?: MembershipLevel[]
}

interface StoryHeaderProps {
  story: Story
  membership?: Membership | null
  favorited: boolean
  subscribed: boolean
}
const StoryHeader: React.FC<StoryHeaderProps> = ({
  story,
  membership,
  favorited,
  subscribed,
}) => {
  const subscriptionModal = useSubscriptionModal()

  const [isFavorited, setIsFavorited] = useState<boolean>(favorited)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribed)

  const { user } = useUser()

  const handleFavorite = () => {
    if (!user) {
      toast.error("You need to log in to favorite a story.")
      return
    }
    // onFavorite()
  }

  const handleSubscribe = () => {
    if (!user) {
      toast.error("You need to log in to subscribe.")
      return
    }
    // onSubscribe()
  }

  return (
    <>
      {story.membershipLevels && (
        <SubscriptionModal
          membership={membership}
          storyMembershipLevels={story.membershipLevels}
        />
      )}

      <div className="w-full p-6 shadow-md rounded-lg flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Image Section */}
        <div className="w-full md:w-1/3">
          <Image
            src={story.image}
            alt={story.title}
            width={200}
            height={200}
            className=""
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          {/* Title & Actions */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{story.title}</h1>
            <div className="flex gap-2">
              <button
                className={`p-2 rounded-full ${
                  isFavorited
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={handleFavorite}
                title={isFavorited ? "Unfavorite" : "Favorite"}
              >
                {isFavorited ? "♥" : "♡"}
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700">{story.description}</p>

          {/* Categories & Tags */}
          <div className="flex flex-wrap gap-2">
            {story?.categories?.map((category) => (
              <span
                key={category.id}
                className="bg-blue-100 px-2 py-1 rounded-md text-sm"
              >
                {category.name}
              </span>
            ))}
            {story.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-600 px-2 py-1 rounded-md text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Views */}
          <div className="text-gray-500 text-sm">Views: {story.views}</div>

          {/* Subscribe Button */}
          <button
            className={`mt-4 py-2 px-4 rounded-md font-semibold ${
              isSubscribed
                ? "bg-gray-300 text-gray-700"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            onClick={() => subscriptionModal.onOpen()}
            disabled={isSubscribed}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>
    </>
  )
}

export default StoryHeader
