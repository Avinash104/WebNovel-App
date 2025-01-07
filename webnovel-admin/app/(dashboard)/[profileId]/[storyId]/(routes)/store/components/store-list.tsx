"use client"

import StoreItemCard from "./store-item-card"

interface StoreItem {
  id: string
  title: string
  description: string
  price: number
  thumbnail?: string | null
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {storeItems.map((item) => (
        <div key={item.id}>
          <StoreItemCard item={item} />
        </div>
      ))}
    </div>
  )
}
