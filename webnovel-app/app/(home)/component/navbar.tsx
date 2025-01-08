import MainNav from "@/app/(home)/component/main-nav"
import Container from "@/app/(home)/component/ui/container"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import React from "react"

const Navbar = () => {
  return (
    <div className="border-b">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <Link href="/" className="ml-4 flex lg:ml-0 gap-x-2">
            <p className="font-bold text-xl">Home</p>
          </Link>
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Navbar
