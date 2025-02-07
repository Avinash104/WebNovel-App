import axios from "axios"
import { Star } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
  storyId: string
  currentRating: number
}

const StarRating: React.FC<StarRatingProps> = ({ storyId, currentRating }) => {
  const [rating, setRating] = useState(currentRating)
  const [hover, setHover] = useState<number | null>(null)

  const handleRating = async (newRating: number) => {
    try {
      setRating(newRating)
      await axios.post(`/api/author-api/stories/${storyId}/rating`, {
        storyId,
        rating: newRating,
      })
    } catch (error) {
      console.error("Error rating story:", error)
    }
  }

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage =
          (hover ?? rating) >= star
            ? 100
            : star - 1 < (hover ?? rating) && star > (hover ?? rating)
            ? ((hover ?? rating) - (star - 1)) * 100
            : 0

        return (
          <div
            key={star}
            className="relative h-6 w-6 cursor-pointer"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => handleRating(star)}
          >
            {/* Empty Star */}
            <Star className="absolute inset-0 text-gray-400" />

            {/* Filled Star with Gradient */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: `${fillPercentage}%`, // Fill up to the percentage
              }}
            >
              <Star className="text-yellow-400" />
            </div>
          </div>
        )
      })}
      <p className="ml-2 text-lg font-semibold">{rating?.toFixed(1)}</p>
    </div>
  )
}

export default StarRating
