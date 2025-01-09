"use client"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Category, MembershipTitle } from "@prisma/client"
import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"

type MembershipLevel = {
  title: MembershipTitle
  chaptersLocked: number
  price: number
}

type formType = {
  title: string
  description: string
  image?: string | null
  tags: string[]
  categories?: Category[] | null
  subscriptionAllowed?: boolean
  membershipLevels?: MembershipLevel[] | null
}

type MembershipLevelSelectorProps = {
  form: UseFormReturn<formType>
  loading: boolean
}

export const MembershipLevelSelector: React.FC<
  MembershipLevelSelectorProps
> = ({ form, loading }) => {
  const availableTitles = ["BRONZE", "SILVER", "GOLD"] as MembershipTitle[]

  const [isMounted, setIsMounted] = useState(false)

  const [activeLevels, setActiveLevels] = useState<MembershipTitle[]>(
    form.watch("membershipLevels")?.map((level) => level.title) || []
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddLevel = () => {
    const currentLevels = form.getValues("membershipLevels") || []
    const nextTitle = availableTitles.find(
      (title) => !activeLevels.includes(title)
    )

    if (nextTitle) {
      const updatedLevels = [
        ...currentLevels,
        { title: nextTitle, chaptersLocked: 0, price: 0 },
      ]
      form.setValue("membershipLevels", updatedLevels)
      setActiveLevels([...activeLevels, nextTitle])
    }
  }

  const handleDeleteLevel = (title: MembershipTitle) => {
    const currentLevels = form.getValues("membershipLevels") || []
    const updatedLevels = currentLevels.filter((level) => level.title !== title)
    form.setValue("membershipLevels", updatedLevels)
    setActiveLevels(activeLevels.filter((active) => active !== title))
  }

  const isDeleteDisabled = (title: MembershipTitle) => {
    const titleIndex = availableTitles.indexOf(title)
    return activeLevels.some(
      (active, index) => availableTitles.indexOf(active) > titleIndex
    )
  }

  if (!isMounted) {
    return null
  }
  return (
    <>
      <FormField
        control={form.control}
        name="membershipLevels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Membership Levels</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {field.value?.map((level, index) => (
                  <div key={index} className="border p-4 rounded-md space-y-2">
                    {/* Title Field */}
                    <FormField
                      control={form.control}
                      name={`membershipLevels.${index}.title`}
                      render={() => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              value={level.title}
                              disabled
                              placeholder="Membership Title"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Chapters Locked Field */}
                    <FormField
                      control={form.control}
                      name={`membershipLevels.${index}.chaptersLocked`}
                      render={({ field: chaptersField }) => (
                        <FormItem>
                          <FormLabel>Chapters Locked</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="Number of Chapters Locked"
                              {...chaptersField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Price Field */}
                    <FormField
                      control={form.control}
                      name={`membershipLevels.${index}.price`}
                      render={({ field: priceField }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              disabled={loading}
                              placeholder="Price"
                              {...priceField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Delete Level Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteLevel(level.title)}
                      disabled={isDeleteDisabled(level.title)}
                    >
                      Delete Level
                    </Button>
                  </div>
                ))}

                {/* Add Level Button */}
                <Button
                  type="button"
                  onClick={handleAddLevel}
                  disabled={activeLevels.length >= availableTitles.length}
                >
                  Add Membership Level
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
