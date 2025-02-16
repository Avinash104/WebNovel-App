"use client"

import { Button } from "@/components/ui/button"
import { Category, Story } from "@prisma/client"
import axios from "axios"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import StoryCard from "../components/story-card"

type StoryWithCategories = Story & {
  categories: Category[]
}

const SearchPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [stories, setStories] = useState<StoryWithCategories[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll("category") || []
  )

  const query = searchParams.get("q") || ""

  // Fetch stories based on search query and selected categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/public-api/categories")
        const categories: Category[] = response.data
        console.log("Fetched categories: ", categories)
        setCategories(categories)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to fetch categories."
          )
        } else {
          toast.error("An unexpected error occurred.")
        }
      }
    }

    fetchCategories()

    const fetchStories = async () => {
      try {
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        selectedCategories.forEach((cat) => params.append("category", cat))

        const response = await axios.get(
          `/api/public-api/search?${params.toString()}`
        )
        const data: StoryWithCategories[] = response.data
        setStories(data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to fetch stories."
          )
        } else {
          toast.error("An unexpected error occurred.")
        }
      }
    }

    fetchStories()
  }, [query, selectedCategories])

  // Update category filter in URL
  const toggleCategory = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]

    setSelectedCategories(updatedCategories)

    const params = new URLSearchParams(searchParams)
    params.delete("category")
    updatedCategories.forEach((cat) => params.append("category", cat))

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="container mx-auto p-4">
      {/* Category Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => toggleCategory(category.name)}
            className={`px-4 py-2 rounded-lg border transition 
      ${
        selectedCategories.includes(category.name)
          ? "bg-blue-500 text-white border-blue-600"
          : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
      } // Default state
    `}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stories.length > 0 ? (
          stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.id}`}>
              <StoryCard story={story} />
            </Link>
          ))
        ) : (
          <p>No stories found.</p>
        )}
      </div>
    </div>
  )
}

export default SearchPage
