"use client"

import { Category } from "@prisma/client"
import React from "react"
import { getSimilarStories } from "../[storyId]/page"

interface SimilarStoriesProps {
  categories: Category
}
const SimilarStories: React.FC<SimilarStoriesProps> = ({ categories }) => {
  return <div>SimilarStories</div>
}

export default SimilarStories
