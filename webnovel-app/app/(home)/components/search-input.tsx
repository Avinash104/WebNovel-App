"use client"

import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import qs from "querystring"
import { useEffect, useState } from "react"

export const SearchInput = () => {
  const [value, setValue] = useState<string>("")
  const debouncedValue = useDebounce(value)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentCategoryId = searchParams.get("categoryId")

  useEffect(() => {
    const url = qs.stringify(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    )

    // router.push(url)
  }, [debouncedValue, currentCategoryId, router, pathname])

  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
      <Input
        onChange={(e) => {
          e.preventDefault()
          setValue(e.target.value)
        }}
        value={value}
        className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200 text-black"
        placeholder="Search for a story"
      />
    </div>
  )
}
