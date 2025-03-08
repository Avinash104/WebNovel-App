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
  const [openPauseOrResumeAlert, setOpenPauseOrResumeAlert] =
    useState<boolean>(false)
  const [openCancelSubAtEndPeriod, setOpenCancelSubAtEndPeriod] =
    useState<boolean>(false)
  const [openCancelSubNow, setOpenCancelSubNow] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isSubActive, setIsSubActive] = useState<boolean>(membership?.isActive)

  let cancelNow = false

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

  const onCancel = async () => {
    try {
      setLoading(true)
      const userId = membership.userId
      const storyId = membership.storyId
      const payload = { userId, storyId, cancelNow }
      console.log(payload)
      await axios.delete("/api/author-api/stripe/subscription/delete", {
        data: payload,
      })
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
      cancelNow = false
      setOpenCancelSubAtEndPeriod(false)
      setOpenCancelSubNow(false)
    }
  }

  const onCancelNow = () => {
    cancelNow = true
    onCancel()
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
        } this subscription for ${membership.story.title}?`}
        description={`You will ${
          isSubActive ? "lose" : "gain"
        } all privileges to the advance chapters.`}
      />
      <AlertModal
        isOpen={openCancelSubAtEndPeriod}
        onClose={() => setOpenCancelSubAtEndPeriod(false)}
        onConfirm={onCancel}
        loading={loading}
        title={`Are you sure you want to cancel this active subscription for ${membership.story.title}?`}
        description="You will lose all privileges to the advance chapters at the end of the current subscription period."
      />
      <AlertModal
        isOpen={openCancelSubNow}
        onClose={() => setOpenCancelSubNow(false)}
        onConfirm={onCancelNow}
        loading={loading}
        title={`Are you sure you want to permanently delete this active subscription for ${membership.story.title}?`}
        description="You will lose all privileges to the advance chapters right away. We rocommend you cancel your subscription instead, so that you can have access to your subscription perks till the end of this billing cycle."
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
          <div className="w-full flex justify-end items-center mt-4 gap-2">
            <Button
              disabled={loading}
              variant="default"
              size="lg"
              onClick={() => setOpenPauseOrResumeAlert(true)}
            >
              {isSubActive ? "Pause Subscription" : "Resume Subscription"}
            </Button>
            <Button
              disabled={loading}
              variant="default"
              size="lg"
              onClick={() => setOpenCancelSubAtEndPeriod(true)}
            >
              Cancel Subscription
            </Button>
            <Button
              disabled={loading}
              variant="destructive"
              size="icon"
              onClick={() => setOpenCancelSubNow(true)}
            >
              <Trash className="h-8 w-8" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MembershipBlock
