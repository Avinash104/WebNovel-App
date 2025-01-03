import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { MainNav } from "@/components/main-nav"
import StorySwitcher from "@/components/story-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import prismadb from "@/lib/prismadb"

const Navbar = async () => {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const stories = await prismadb.story.findMany({
    where: {
      userId: user.id,
    },
  })

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <StorySwitcher items={stories} className="mx-2" />
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  )
}

export default Navbar
