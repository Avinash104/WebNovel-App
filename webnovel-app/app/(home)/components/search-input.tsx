"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export const SearchInput = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [value, setValue] = useState<string>(query)
  const currentCategory = searchParams.get("category")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (value) {
      params.set("q", value)
    }
    if (currentCategory) {
      params.set("category", currentCategory)
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSearch}
        className="absolute top-3 left-3 text-slate-600"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
      <Input
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        value={value}
        className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200 text-black"
        placeholder="Search for a story"
      />
    </div>
  )
}
