"use client"

import { AlertModal } from "@/components/modals/alert-modal"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExtendedMembership } from "@/lib/utils"
import axios from "axios"
import { Trash } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"
import { toast } from "react-hot-toast"

interface MembershipBlockProps {
  membership: ExtendedMembership
}

const MembershipBlock: React.FC<MembershipBlockProps> = ({ membership }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  //   useEffect(() => {
  //     console.log("subscriptons: ", membership)
  //   }, [membership])

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/author-api/membership/${membership.id}`)
      toast.success("Subscription deleted successfully.")
      window.location.reload()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        title={`Are you sure you want to delete this active subscription for ${membership.story.title}?`}
        description="You will lose all privileges to the advance chapters."
      />
      <Card className="w-full mx-auto p-4 shadow-md border rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-2xl hover:underline">
              <Link href={`/stories/${membership.story.id}`}>
                {membership.story.title}
              </Link>
            </CardTitle>
            <span className="text-base">
              Subscribed On:{" "}
              {new Date(membership.subscribedAt).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          Subscription Level: {membership.membershipLevel.title}
          <br />
          Auto Renewal of this subscription is{" "}
          {membership.autoRenew ? "On" : "Off"}
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-end items-center mt-4 ">
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MembershipBlock
