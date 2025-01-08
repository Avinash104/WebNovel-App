"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Category } from "@prisma/client"
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

type CategorySelectorProps = {
  form: UseFormReturn<formType>
  storyCategories: Category[]
  setStoryCategories: React.Dispatch<React.SetStateAction<string[]>>
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  form,
  storyCategories,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }
  return (
    <>
      {storyCategories.length > 0 && (
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Select categories</FormLabel>
                <FormDescription>
                  Select the categories that best describe your story.
                </FormDescription>
              </div>
              <div className="space-y-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {storyCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-row items-start space-x-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(category.id) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([
                              ...(field.value ?? []),
                              category.id,
                            ])
                          } else {
                            field.onChange(
                              field.value?.filter(
                                (value) => value !== category.id
                              )
                            )
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="bottom-0 text-base md:text-xl font-semibold ml-5">
                      {category.name}
                    </FormLabel>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}

export default CategorySelector
