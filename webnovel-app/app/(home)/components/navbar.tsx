import MainNav from "@/app/(home)/components/main-nav"
import Container from "@/app/(home)/components/ui/container"
import UserProfileButton from "@/app/(home)/components/user-profile-button"
import { ThemeToggle } from "@/components/theme-toggle"
import prismadb from "@/lib/prismadb"
// import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import React from "react"
import Notifications from "./notifications"

const Navbar = async () => {
  const user = await currentUser()

  let notificationFeed = []
  if (user) {
    console.log("user: ", user.id)
    notificationFeed = await prismadb.notification.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div className="border-b">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center ">
          <Link href="/" className="ml-4 flex lg:ml-0 gap-x-2">
            <p className="font-bold text-2xl">Home</p>
          </Link>
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Notifications notificationFeed={notificationFeed} />
                <UserProfileButton />
              </>
            ) : (
              <Link href={"/sign-in"}>Sign In</Link>
            )}
            {/* {user ? <UserButton /> : <Link href={"/sign-in"}>Sign In</Link>} */}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Navbar
