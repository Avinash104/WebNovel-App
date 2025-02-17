"use client"

import { ExtendedMembership } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import React, { useEffect, useState } from "react"
import MembershipBlock from "./membership-block"

interface MembershipSectionProps {
  memberships: ExtendedMembership[]
}

const MembershipSection: React.FC<MembershipSectionProps> = ({
  memberships,
}) => {
  const { user } = useUser()
  const [loading, setLoading] = useState<boolean>(false)

  //   const setSubscriptionModalOpen = () => {
  //     if (!user) {
  //       return toast.error("You need to be logged in to post a review.")
  //     }
  //     setLoading(true)
  //     subscriptionModal.onOpen()
  //     setLoading(false)
  //   }

  //   useEffect(() => {
  //     console.log("subscriptons: ", memberships)
  //   }, [memberships])

  return (
    <>
      <div className="flex items-center justify-between px-6 mb-3">
        <h3 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Active Subscriptions
        </h3>
      </div>
      <div className="px-6 mb-3">
        {memberships && memberships?.length > 0 ? (
          memberships.map((membership) => (
            <div key={membership.id}>
              <MembershipBlock membership={membership} />
            </div>
          ))
        ) : (
          <div>
            <p>No active subscriptions available.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default MembershipSection
