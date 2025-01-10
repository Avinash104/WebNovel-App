"use client"

import { Check, ChevronsUpDown, PlusCircle, Store } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useStoryModal } from "@/hooks/use-story-modal"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface StorySwitcherProps extends PopoverTriggerProps {
  items: Record<string, any>[]
}

export default function StorySwitcher({
  className,
  items = [],
}: StorySwitcherProps) {
  const storyModal = useStoryModal()
  const params = useParams()

  const formattedItems = items.map((item) => ({
    id: item.id,
    title: item.title,
  }))

  const currentStory = formattedItems.find((item) => item.id === params.storyId)

  const [open, setOpen] = React.useState(false)

  const onStorySelect = (story: { id: string; title: string }) => {
    setOpen(false)
    window.location.assign(`/author/${params.profileId}/${story.id}/chapters`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn("w-[200px] justify-between", className)}
        >
          <Store className="mr-2 h-4 w-4" />
          {currentStory?.title}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search Story..." />
            <CommandEmpty>No stories found.</CommandEmpty>
            <CommandGroup heading="Stories">
              {formattedItems.map((story) => (
                <CommandItem
                  key={story.id}
                  onSelect={() => onStorySelect(story)}
                  className="text-sm"
                >
                  <Store className="mr-2 h-4 w-4" />
                  {story.title}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentStory?.id === story.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  storyModal.onOpen()
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create a new story!
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
