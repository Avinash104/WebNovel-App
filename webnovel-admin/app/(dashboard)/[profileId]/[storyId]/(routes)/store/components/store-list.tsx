"use client"

import Image from "next/image"
import React from "react"

interface StoreItem {
  id: string
  title: string
  description: string
  price: number
  image?: string | null
  pdfLink: string
}

interface StoreListProps {
  storeItems: StoreItem[]
  loading: boolean
}

export const StoreList: React.FC<StoreListProps> = ({
  storeItems,
  loading,
}) => {
  if (loading) {
    return <div className="text-center">Loading store items...</div>
  }

  if (storeItems.length === 0) {
    return <div className="text-center">No items available in the store.</div>
  }

  //   const onDelete = async () => {
  //   try {
  //     setLoading(true)
  //     await axios.delete(`/api/prfile/${params.profileId}/store/${storeId}`)
  //     toast.success("Item deleted.")
  //     window.location.reload()
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       toast.error("Something went wrong!!", error.response?.data?.message)
  //     } else {
  //       toast.error("Something went wrong!!")
  //     }
  //   } finally {
  //     setLoading(false)
  //     setOpen(false)
  //   }
  // }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {storeItems.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg shadow-md p-4 hover:shadow-lg transition"
        >
          <div className="relative h-40 w-full mb-4">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                layout="fill"
                className="object-cover rounded"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{item.description}</p>
          <div className="text-primary font-bold mb-2">
            ${item.price.toFixed(2)}
          </div>
          <button className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition">
            Buy Now
          </button>
        </div>
      ))}
    </div>
  )
}
