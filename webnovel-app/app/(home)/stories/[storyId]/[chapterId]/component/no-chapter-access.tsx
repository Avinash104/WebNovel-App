"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { Button } from "@/components/ui/button"
import { useSubscriptionModal } from "@/hooks/use-subscription-modal"
import { useUser } from "@clerk/nextjs"
import { Membership, MembershipLevel } from "@prisma/client"
import axios from "axios"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface NoChapterAccessProps {
  storyMembershipLevels: MembershipLevel[]
  membership?: Membership | null
  isSubscribed: boolean
  subscriptionLevel: string | null
}
const NoChapterAccess: React.FC<NoChapterAccessProps> = ({
  storyMembershipLevels,
  membership,
  isSubscribed,
  subscriptionLevel,
}) => {
  const subscriptionModal = useSubscriptionModal()

  const [openPauseOrResumeAlert, setOpenPauseOrResumeAlert] =
    useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isSubActive, setIsSubActive] = useState<boolean>(
    membership?.isActive || false
  )

  const { user } = useUser()

  const handleSubscribe = () => {
    if (!user) {
      toast.error("You need to log in to subscribe to a story.")
      return
    }
    subscriptionModal.onOpen()
  }

  const handleSubscribeButtonDisplay = () => {
    if (!user) return "Log in to subscribe"

    if (!isSubActive) {
      return "Resume Subscription"
    }

    switch (subscriptionLevel) {
      case "BRONZE":
      case "SILVER":
        return "Upgrade Subscription"
      case "GOLD":
        return "Subscribed"
      default:
        return "Subscribe"
    }
  }

  const onPauseOrResume = async () => {
    try {
      setLoading(true)
      const userId = membership?.userId
      const storyId = membership?.storyId
      const membershipId = membership?.id
      const payload = { userId, storyId, membershipId }

      if (isSubActive) {
        await axios.patch("/api/author-api/stripe/subscription/pause", {
          data: payload,
        })
        toast.success("Subscription paused successfully.")
        setIsSubActive(false)
      } else {
        await axios.patch("/api/author-api/stripe/subscription/resume", {
          data: payload,
        })
        toast.success("Subscription resumed successfully.")
        setIsSubActive(true)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
      setOpenPauseOrResumeAlert(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={openPauseOrResumeAlert}
        onClose={() => setOpenPauseOrResumeAlert(false)}
        onConfirm={onPauseOrResume}
        loading={loading}
        title={`Are you sure you want to ${
          isSubActive ? "pause" : "resume"
        } this subscription for this story.`}
        description={`You will ${
          isSubActive ? "lose" : "gain"
        } all privileges to the advance chapters.`}
      />
      {storyMembershipLevels && (
        <SubscriptionModal
          storyMembershipLevels={storyMembershipLevels}
          profileMembership={membership || null}
        />
      )}

      <div className="flex flex-col items-center justify-center py-4">
        <p className="px-6">
          You do not have access to this chapter. Please subscribe/upgrade your
          subscription to unlock it.
        </p>
        {isSubActive ? (
          <Button
            className={`py-2 px-4 rounded-md font-semibold ${
              isSubscribed
                ? "bg-gray-300 text-gray-700"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            onClick={handleSubscribe}
            disabled={subscriptionLevel === "GOLD" || loading}
          >
            {handleSubscribeButtonDisplay()}
          </Button>
        ) : (
          <Button
            className={`py-2 px-4 rounded-md font-semibold ${
              isSubscribed
                ? "bg-gray-300 text-gray-700"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            onClick={onPauseOrResume}
            disabled={subscriptionLevel === "GOLD" || loading}
          >
            {handleSubscribeButtonDisplay()}
          </Button>
        )}
      </div>
    </>
  )
}

export default NoChapterAccess
