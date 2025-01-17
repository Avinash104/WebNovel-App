"use client"

import { usePathname } from "next/navigation"
import React from "react"
import { SearchInput } from "./search-input"

interface MainNavProps {
  // data: any
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
  //   const pathname = usePathname()
  //   const routes = data.map((route) => ({
  //     href: `/category/${route.id}`,
  //     label: route.name,
  //     active: pathename === ``
  //   }))
  return (
    <div className="flex items-center justify-center">
      MainNav
      <SearchInput />
    </div>
  )
}

export default MainNav
