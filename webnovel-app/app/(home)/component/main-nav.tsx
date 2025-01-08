"use client"

import { usePathname } from "next/navigation"
import React from "react"

interface MainNavProps {
  data: any
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
  //   const pathname = usePathname()
  //   const routes = data.map((route) => ({
  //     href: `/category/${route.id}`,
  //     label: route.name,
  //     active: pathename === ``
  //   }))
  return <div>MainNav</div>
}

export default MainNav
