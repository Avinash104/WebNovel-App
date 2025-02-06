import { Story } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export enum pageType {
  PROFILE,
  STORY,
}

export enum CommentType {
  PROFILE_WALL,
  STORY,
  CHAPTER,
  STORE_ITEM,
}

export interface StoryWithViews extends Story {
  totalViews: number
  author: string
}
