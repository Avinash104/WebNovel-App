"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"

type formType = {
  name: string
  description: string
  tags: string[]
  image?: string | null
  categories?: string[] | null
  subscriptionAllowed?: boolean
  subscriptionPrice?: number | null
  numberOfLockedChapters?: number | null
}

type TagSelectorProps = {
  form: UseFormReturn<formType>
  loading: boolean
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
}

const TagSelector: React.FC<TagSelectorProps> = ({
  form,
  loading,
  selectedTags,
  setSelectedTags,
}) => {
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    form.setValue("tags", selectedTags)
  }, [selectedTags, form])

  const handleAddNewTag = () => {
    const trimmedInput = tagInput.trim()
    if (!trimmedInput || selectedTags.includes(trimmedInput)) return

    setSelectedTags((prev) => [...prev, trimmedInput])
    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  return (
    <>
      <FormField
        name="tags"
        control={form.control}
        render={({ fieldState }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="relative">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                disabled={loading}
              />
              <>
                <Button
                  type="button"
                  className="bg-sky-400 absolute bottom-[2px] right-[2px] z-10 w-20 md:w-36"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddNewTag}
                >
                  Add
                </Button>
              </>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  className="cursor-pointer px-2 py-1 text-base bg-sky-400"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>

            {fieldState.error?.message && (
              <p className="text-sm text-red-500 mt-2">
                {fieldState.error.message}
              </p>
            )}
          </FormItem>
        )}
      />
    </>
  )
}

export default TagSelector
