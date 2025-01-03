"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import React, { useState } from "react"
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
  const [isInputFocused, setIsInputFocused] = useState(false)

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
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              {isInputFocused && tagInput.trim() && (
                <div
                  className="absolute bg-transparent mt-1 p-2 w-fit"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Button
                    className="bg-sky-400"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddNewTag}
                  >
                    Add <b>{tagInput.trim()}</b>
                  </Button>
                </div>
              )}
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
