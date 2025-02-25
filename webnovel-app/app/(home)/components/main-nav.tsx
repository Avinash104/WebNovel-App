"use client"

import { usePathname } from "next/navigation"
import React, { useEffect } from "react"
import { SearchInput } from "./search-input"
import Container from "./ui/container"

interface MainNavProps {
  // data: any
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
  const pathname = usePathname()

  useEffect(() => {
    console.log("pathname :", pathname)
  }, [pathname])
  //   const routes = data.map((route) => ({
  //     href: `/category/${route.id}`,
  //     label: route.name,
  //     active: pathename === ``
  //   }))
  return (
    <Container>
      <SearchInput />
    </Container>
  )
}

export default MainNav
