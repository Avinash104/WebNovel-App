"use client"

import { Button } from "@/components/ui/button"
import { useStoreModal } from "@/hooks/use-store-modal"
import { StoreItem } from "@prisma/client"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { StoreList } from "./components/store-list"

const StorePage = ({
  params: { profileId },
}: {
  params: { profileId: string }
}) => {
  const storeModal = useStoreModal()
  const [loading, setLoading] = useState(true)
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])

  useEffect(() => {
    const fetchStoreItems = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/profile/${profileId}/store`)
        if (!Array.isArray(response.data) || response.data.length === 0) {
          return toast.error("No items exist in the store.")
        }
        setStoreItems(response.data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            "Unable to fetch store items.",
            error.response?.data?.message
          )
        } else {
          toast.error("Error while fetching the store items.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStoreItems()
  }, [profileId])

  return (
    <div className="w-full">
      <div className="space-y-4 p-4 sm:p-8 pt-6 w-full">
        This is the store page <Button onClick={storeModal.onOpen}>Add</Button>
        <div className="w-full">
          {loading ? (
            <div>Loading store items...</div>
          ) : (
            !loading && <StoreList storeItems={storeItems} loading={loading} />
          )}
        </div>
      </div>
    </div>
  )
}

export default StorePage
