import { Conversation, Membership } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MESSAGES_PAGE_SIZE = 20
export const ORDERS_PAGE_SIZE = 20

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

export enum NotificationType {
  MESSAGE,
  PROFILE_WALL,
  STORY,
  CHAPTER,
  STORE_ITEM,
}

export enum MessageDeliveryStateType {
  DRAFT,
  SENT,
  DELIVERED,
  READ,
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

export interface Participant {
  id: string
  username: string
}

// Extend Prisma's `Conversation` type to include `unreadMessages`
export type ExtendedConversation = Conversation & {
  participants: { id: string; username: string }[] // Keep relevant user details
  unreadMessages: number
}
