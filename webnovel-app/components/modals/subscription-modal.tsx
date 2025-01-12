"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Modal } from "@/components/ui/modal"
import { useSubscriptionModal } from "@/hooks/use-subscription-modal"
import { useUser } from "@clerk/nextjs"
import { Membership, MembershipLevel, MembershipPeriod } from "@prisma/client"
import axios from "axios"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface SubscriptionModalProps {
  storyMembershipLevels: MembershipLevel[]
  profileMembership: Membership
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  storyMembershipLevels,
  profileMembership,
}) => {
  const { user } = useUser()
  const params = useParams()
  const subscriptionModal = useSubscriptionModal()

  const [loading, setLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [discountedAmount, setDiscountedAmount] = useState<number>()
  const [isAutoRenewOn, setIsAutoRenewOn] = useState<boolean>(true)
  const [period, setPeriod] = useState<string>("MONTHLY")

  useEffect(() => {
    console.log("levels:  ", storyMembershipLevels)
    console.log("selected level: ", selectedLevel)
    console.log("Auto renew : ", isAutoRenewOn)
  }, [storyMembershipLevels, selectedLevel, isAutoRenewOn])

  const onSubmit = async () => {
    try {
      setLoading(true)
      const userId = user?.id
      const storyId = params.storyId as string
      if (!userId || !storyId || !selectedLevel || !period) {
        return toast.error("Something went wrong!!")
      }
      const values = { userId, storyId, selectedLevel, isAutoRenewOn, period }
      console.log("values: ", values)
      await axios.post("/api/author-api/membership", values)
      toast.success("Successfully subscribed!!")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
      subscriptionModal.onClose()
    }
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
              {storyMembershipLevels?.map((level) => (
                <div
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-transform transform hover:scale-105 ${
                    selectedLevel === level.id
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {level.title}
                  </h3>
                  <p className="text-gray-600">
                    {calculatePrice(period, level.price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Get early access to {level.chaptersLocked} chapters.
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-around">
              <div
                className={`border-2 p-4 rounded-md cursor-pointer ${
                  period === MembershipPeriod.MONTHLY
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
                onClick={() => setPeriod(MembershipPeriod.MONTHLY)}
              >
                {MembershipPeriod.MONTHLY}
              </div>
              <div
                className={`border-2 p-4 rounded-md cursor-pointer ${
                  period === MembershipPeriod.QUARTERLY
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
                onClick={() => setPeriod(MembershipPeriod.QUARTERLY)}
              >
                {MembershipPeriod.QUARTERLY}
              </div>
              <div
                className={`border-2 p-4 rounded-md cursor-pointer ${
                  period === MembershipPeriod.HALFYEARLY
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
                onClick={() => setPeriod(MembershipPeriod.HALFYEARLY)}
              >
                {MembershipPeriod.HALFYEARLY}
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
