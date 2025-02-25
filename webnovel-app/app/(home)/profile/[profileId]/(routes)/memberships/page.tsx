import MembershipSection from "@/app/(home)/components/membership-section"
import prismadb from "@/lib/prismadb"
import React from "react"

const MembershipsPage = async ({
  params,
}: {
  params: { profileId: string }
}) => {
  const { profileId } = params
  const memberships = await prismadb.membership.findMany({
    where: {
      userId: profileId,
    },
    orderBy: {
      subscribedAt: "desc",
    },
    include: {
      story: {
        select: {
          id: true,
          title: true,
        },
      },
      membershipLevel: {
        select: {
          title: true,
        },
      },
    },
  })

  return (
    <div className="w-full mt-4">
      {memberships && <MembershipSection memberships={memberships} />}
    </div>
  )
}

export default MembershipsPage
