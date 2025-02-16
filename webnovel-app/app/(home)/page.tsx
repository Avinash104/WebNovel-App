"use client"

import StorySection from "@/app/(home)/components/story-section"
import { useProfileModal } from "@/hooks/use-profile-modal"
import { useUser } from "@clerk/nextjs"
import { Story } from "@prisma/client"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

const HomePage = () => {
  const onOpen = useProfileModal((state) => state.onOpen)
  const isOpen = useProfileModal((state) => state.isOpen)

  const [stories, setStories] = useState<Story[]>()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/author-api/profile/${user.id}`)
          const profile = response.data
          if (!profile?.username) {
            if (!isOpen) {
              onOpen()
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data || "Something went wrong!!")
          } else {
            toast.error("Something went wrong!!")
          }
        }
      }
      fetchUser()
    }
  }, [isOpen, onOpen, user])

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get("api/public-api/stories")
        const stories: Story[] = response.data
        console.log("Fetched stories: ", stories)
        setStories(stories)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to fetch stories."
          )
        } else {
          toast.error("An unexpected error occurred.")
        }
      }
    }

    fetchStories()
  }, [])

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Public Story Site
        </h1>
        <p className="">Explore stories and dive into chapters.</p>
        <div>
          {stories?.length ? (
            <StorySection stories={stories} />
          ) : (
            <p>No stories available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
