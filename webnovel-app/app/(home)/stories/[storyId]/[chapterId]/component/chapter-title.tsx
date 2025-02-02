import React from "react"

interface ChapterTitleProps {
  title: string
}
const ChapterTitle: React.FC<ChapterTitleProps> = ({ title }) => {
  return <h3 className="text-2xl font-semibold text-center my-6">{title}</h3>
}

export default ChapterTitle
