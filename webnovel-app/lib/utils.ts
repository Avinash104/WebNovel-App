import { Conversation, Membership, Message, Profile } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PAGE_SIZE = 20

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

export type ExtendedMembership = Membership & {
  story: {
    id: string
    title: string
  }
  membershipLevel: {
    title: string
  }
}

export type ExtendedConversation = Conversation & {
  participants: Profile[]
  messages: Message[]
}
