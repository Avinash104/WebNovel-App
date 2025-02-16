import prismadb from "@/lib/prismadb"
import { Membership } from "@prisma/client"
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
  })

  return (
    <div className="w-full mt-4">
      {memberships &&
        memberships?.map((membership: Membership) => (
          <div key={membership.id}>{membership.storyId}</div>
        ))}
    </div>
  )
}

export default MembershipsPage
