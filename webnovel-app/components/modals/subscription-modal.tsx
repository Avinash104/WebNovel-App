"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Modal } from "@/components/ui/modal"
import { useSubscriptionModal } from "@/hooks/use-subscription-modal"
import { useUser } from "@clerk/nextjs"
import { Membership, MembershipLevel } from "@prisma/client"
import axios from "axios"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { toast } from "react-hot-toast"

interface SubscriptionModalProps {
  storyMembershipLevels: MembershipLevel[]
  profileMembership: Membership | null
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  storyMembershipLevels,
  profileMembership,
}) => {
  const { user } = useUser()
  const params = useParams()
  const subscriptionModal = useSubscriptionModal()

  const [loading, setLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    () => profileMembership?.membershipLevelId || null
  )
  const [isAutoRenewOn, setIsAutoRenewOn] = useState<boolean>(true)
  const [period, setPeriod] = useState<string>(
    () => profileMembership?.membershipPeriod || "MONTHLY"
  )

  // Get the index of the user's current membership level
  let currentLevelIndex: number
  if (profileMembership) {
    currentLevelIndex = storyMembershipLevels?.findIndex(
      (level) => level.id === profileMembership?.membershipLevelId
    )
  }

  // Restrict selecting lower membership levels
  const handleLevelSelection = (levelId: string, levelIndex: number) => {
    if (levelIndex <= currentLevelIndex) {
      toast.error("You can only upgrade your membership level.")
      return
    }
    setSelectedLevel(levelId)
  }

  // Restrict selecting shorter periods if membership exist for the user
  const handlePeriodSelection = (selectedPeriod: string) => {
    const periodsOrder = ["MONTHLY", "QUARTERLY", "HALFYEARLY"]

    if (profileMembership) {
      const currentPeriodIndex = periodsOrder.indexOf(
        profileMembership?.membershipPeriod
      )

      const selectedPeriodIndex = periodsOrder.indexOf(selectedPeriod)

      if (selectedPeriodIndex <= currentPeriodIndex) {
        toast.error("You can only switch to a longer membership period.")
        return
      }
    }

    setPeriod(selectedPeriod)
  }

  const calculatePrice = (period: string, price: number) => {
    switch (period) {
      case "QUARTERLY":
        return (3 * price).toFixed(2)
      case "HALFYEARLY":
        return (6 * price).toFixed(2)
      default:
        return price.toFixed(2)
    }
  }

  const onSubmit = async () => {
    try {
      setLoading(true)
      const userId = user?.id
      const storyId = params.storyId as string
      if (!userId || !storyId || !selectedLevel || !period) {
        return toast.error("Select an option.")
      }
      const values = { userId, storyId, selectedLevel, isAutoRenewOn, period }
      await axios.post("/api/author-api/membership", values)
      window.location.reload()
      toast.success("Successfully subscribed!")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!")
      }
    } finally {
      setLoading(false)
      subscriptionModal.onClose()
    }
  }

  return (
    <Modal
      title="Choose a subscription"
      description="We appreciate your support for the author..."
      isOpen={subscriptionModal.isOpen}
      onClose={subscriptionModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <div className="w-full p-4 space-y-6">
            {/* Membership Levels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {storyMembershipLevels?.map((level, index) => (
                <div
                  key={level.id}
                  onClick={() => handleLevelSelection(level.id, index)}
                  className={`border rounded-lg p-4 cursor-pointer transition-transform transform hover:scale-105 ${
                    selectedLevel === level.id
                      ? "border-blue-500 bg-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  <h3 className="text-lg font-semibold">{level.title}</h3>
                  <p className="">${calculatePrice(period, level.price)}</p>
                  <p className="text-sm">
                    Get early access to {level.chaptersLocked} chapters.
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-around">
              <div
                className={`border-2 p-4 rounded-md cursor-pointer ${
                  period === "MONTHLY"
                    ? "border-blue-500 bg-blue-600"
                    : "border-gray-300"
                }`}
                onClick={() => handlePeriodSelection("MONTHLY")}
              >
                MONTHLY
              </div>
              <div
                className={`border-2 p-4 rounded-md cursor-pointer ${
                  period === "QUARTERLY"
                    ? "border-blue-500 bg-blue-600"
                    : "border-gray-300"
                }`}
                onClick={() => handlePeriodSelection("QUARTERLY")}
              >
                QUARTERLY
              </div>
              <div
                className={`border-2 p-4 rounded-md cursor-pointer ${
                  period === "HALFYEARLY"
                    ? "border-blue-500 bg-blue-600"
                    : "border-gray-300"
                }`}
                onClick={() => handlePeriodSelection("HALFYEARLY")}
              >
                HALFYEARLY
              </div>
            </div>

            <div>
              <Checkbox
                onClick={() => {
                  setIsAutoRenewOn(!isAutoRenewOn)
                }}
                checked={isAutoRenewOn}
                className="mr-2"
              />
              Auto-Renew membership
            </div>
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button
              disabled={loading}
              variant="outline"
              onClick={(event) => {
                event.preventDefault()
                subscriptionModal.onClose()
              }}
            >
              Cancel
            </Button>
            <Button disabled={loading} onClick={onSubmit}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
