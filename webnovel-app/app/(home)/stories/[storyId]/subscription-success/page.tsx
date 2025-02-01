"use client"

import axios from "axios"
import { Loader2 } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

const SubscriptionSuccessPage = () => {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const storyId = params.storyId
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId || !storyId) return

    const confirmSubscription = async () => {
      try {
        await axios.post("/api/author-api/membership", {
          sessionId,
        })
        toast.success("Subscription activated successfully!")
        router.push(`/stories/${storyId}`)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            "Failed to activate subscription.",
            error.response?.data?.message
          )
          router.push(`/stories/${storyId}`)
        } else {
          toast.error("Something went wrong!")
        }
      } finally {
        setLoading(false)
      }
    }

    confirmSubscription()
  }, [sessionId, storyId, router])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {loading ? (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-300" />
          <p className="text-lg mt-4">Processing your payment...</p>
        </>
      ) : (
        <p className="text-lg">Redirecting...</p>
      )}
    </div>
  )
}

export default SubscriptionSuccessPage
