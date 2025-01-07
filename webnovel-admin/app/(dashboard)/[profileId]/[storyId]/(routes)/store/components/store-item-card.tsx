"use client"
import { Button } from "@/components/ui/button"
import { StoreItem } from "@prisma/client"
import axios from "axios"
import { Trash } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface StoreItemCardProps {
  item: StoreItem
}
const StoreItemCard: React.FC<StoreItemCardProps> = ({ item }) => {
  const params = useParams()

  const [loading, setLoading] = useState(false)

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(
        `/api/profile/${params.profileId}/store/${item.storeId}/${item.id}`
      )
      toast.success("Item deleted.")
      window.location.reload()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error("Something went wrong!!", error.response?.data?.message)
      } else {
        toast.error("Something went wrong!!")
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div
      key={item.id}
      className="border rounded-lg shadow-lg p-4 hover:shadow-xl transition transform hover:scale-105"
    >
      <div className="h-48 w-full mb-4">
        {item.thumbnail ? (
          <div className="relative h-full w-full rounded-md overflow-hidden">
            <Image
              className="object-cover"
              alt={item.title}
              layout="fill"
              src={item.thumbnail}
            />
            <div className="absolute top-2 right-2 z-20 cursor-pointer">
              <Button
                type="button"
                onClick={onDelete}
                variant={"destructive"}
                size="icon"
                disabled={loading}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center border border-gray-300">
            <span className="text-gray-500 text-sm">No Thumbnail</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {item.description.length > 100 ? (
            <>
              {item.description.slice(0, 100)}...
              <Button
                onClick={() => alert("Show full description")}
                className="text-primary hover:underline ml-1"
              >
                Read more
              </Button>
            </>
          ) : (
            item.description
          )}
        </p>
        <div className="text-primary font-bold text-lg mb-2">
          ${item.price.toFixed(2)}
        </div>
      </div>
    </div>
  )
}

export default StoreItemCard
