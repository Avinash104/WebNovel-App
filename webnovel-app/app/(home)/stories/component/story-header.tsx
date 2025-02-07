"use client"

import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { Button } from "@/components/ui/button"
import { useSubscriptionModal } from "@/hooks/use-subscription-modal"
import { useUser } from "@clerk/nextjs"
import { Category, Membership, MembershipLevel } from "@prisma/client"
import axios from "axios"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { toast } from "react-hot-toast"
import StarRating from "./star-rating"

type Story = {
  id: string
  title: string
  description: string
  author: string
  image?: string
  stars: number
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
  isSubscribed: boolean
  subscriptionLevel: string | null
  isAuthorFollowedByUser: boolean
}
const StoryHeader: React.FC<StoryHeaderProps> = ({
  story,
  membership,
  favorited,
  isSubscribed,
  subscriptionLevel,
  isAuthorFollowedByUser,
}) => {
  const subscriptionModal = useSubscriptionModal()
  const params = useParams()

  const [isFavorited, setIsFavorited] = useState<boolean>(favorited)
  const [isAuthorFollowed, setIsAuthorFollowed] = useState<boolean>(
    isAuthorFollowedByUser
  )

  const { user } = useUser()

  const handleFavorite = async () => {
    if (!user) {
      toast.error("You need to log in to favorite a story.")
      return
    }

    try {
      setIsFavorited(!isFavorited)
      const favoriteStory = { storyId: params.storyId }
      await axios.patch(`/api/author-api/profile/${user.id}`, favoriteStory)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong.", error.response?.data?.message)
      } else {
        toast.error("Something went wrong.")
      }
    }
  }

  const handleFollow = async () => {
    if (!user) {
      toast.error("You need to log in to follow.")
      return
    }

    console.log("handle follow")

    try {
      setIsAuthorFollowed(!isAuthorFollowed)
      const payload = { followingChanged: true, authorUsername: story.author }
      await axios.patch(`/api/author-api/profile/${user.id}`, payload)
      console.log("sending payload ", payload)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong.", error.response?.data?.message)
      } else {
        toast.error("Something went wrong.")
      }
    }
  }

  const handleSubscribe = () => {
    if (!user) {
      toast.error("You need to log in to subscribe to a story.")
      return
    }
    subscriptionModal.onOpen()
  }

  const handleSubscribeButtonDisplay = () => {
    if (!user) return "Log in to subscribe"

    switch (subscriptionLevel) {
      case "BRONZE":
      case "SILVER":
        return "Upgrade"
      case "GOLD":
        return "Subscribed"
      default:
        return "Subscribe"
    }
  }

  return (
    <>
      {story.membershipLevels && (
        <SubscriptionModal
          profileMembership={membership || null}
          storyMembershipLevels={story.membershipLevels}
        />
      )}

      <div className="w-full p-6 shadow-md rounded-lg flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Image Section */}
        <div className="w-full h-full md:w-1/3 flex items-center justify-center">
          {story && (
            <Image
              src={
                story.image ||
                "https://res.cloudinary.com/df9eayrlw/image/upload/v1735992315/story-icon-png-8_wvpzbr.png"
              }
              alt={story.title}
              width={200}
              height={200}
              className=""
            />
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          {/* Title & Actions */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{story.title}</h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Button
                className={`p-3 rounded-full ${
                  isFavorited
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={handleFavorite}
                title={isFavorited ? "Unfavorite" : "Favorite"}
              >
                {isFavorited ? (
                  <Heart className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4 bg-slate-100" />
                )}
              </Button>
              <Button
                className={`py-2 px-4 rounded-md font-semibold ${
                  isSubscribed
                    ? "bg-gray-300 text-gray-700"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                onClick={handleSubscribe}
                disabled={subscriptionLevel === "GOLD"}
              >
                {handleSubscribeButtonDisplay()}
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center justify-start">
              <Link href={`/users/${story.author}`} className="">
                <span className="font-semibold">By </span>
                <span className="font-bold text-sky-400 hover:underline">
                  {" "}
                  {story.author}
                </span>
              </Link>
              <button
                className="bg-orange-400 hover:bg-orange-500 border-2 hover:scale-105 transform translate-x-0 px-2 rounded-md shadow-md"
                onClick={handleFollow}
              >
                {isAuthorFollowed ? "Followed" : "Follow"}
              </button>
            </div>
            <StarRating storyId={story.id} currentRating={story.stars} />
          </div>

          {/* Description */}
          <p className="">{story.description}</p>
          {/* Categories & Tags */}
          <div className="flex flex-wrap flex-col gap-2">
            <div className="flex items-center">
              {story?.categories?.map((category) => (
                <span
                  key={category.id}
                  className="bg-blue-600 px-2 py-1 rounded-md mx-2"
                >
                  {category.name}
                </span>
              ))}
            </div>

            <div>
              {story.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-600 mx-1 px-2 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-gray-500">Views: {story.views}</div>
        </div>
      </div>
    </>
  )
}

export default StoryHeader
