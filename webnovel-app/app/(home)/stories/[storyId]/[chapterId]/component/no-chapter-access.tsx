"use client"

import { SubscriptionModal } from "@/components/modals/subscription-modal"
import { Button } from "@/components/ui/button"
import { useSubscriptionModal } from "@/hooks/use-subscription-modal"
import { useUser } from "@clerk/nextjs"
import { Membership, MembershipLevel } from "@prisma/client"
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
    </>
  )
}

export default NoChapterAccess
