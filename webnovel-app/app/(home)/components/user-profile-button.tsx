"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SignOutButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

const UserProfileButton = () => {
  const pathname = usePathname()

  const { user } = useUser()

  const routes = [
    {
      href: `/profile/${user?.id}/home`,
      label: "Profile",
      active: pathname === `/profile/${user?.id}`,
    },
    {
      href: `/profile/${user?.id}/messages`,
      label: "Messages",
      active: pathname === `/profile/${user?.id}/messages`,
    },
    {
      href: `/profile/${user?.id}/favorites`,
      label: "Favorities",
      active: pathname === `/profile/${user?.id}/favorities`,
    },
    {
      href: `/profile/${user?.id}/memberships`,
      label: "Memberships",
      active: pathname === `/profile/${user?.id}/memberships`,
    },
  ]

  return (
    <div className="relative">
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {routes.map((route) => (
              <DropdownMenuItem
                key={route.href}
                className="hover:cursor-pointer"
              >
                <Link
                  href={route.href}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary",
                    route.active
                      ? "text-black dark:text-white"
                      : "text-muted-foreground"
                  )}
                >
                  {route.label}
                </Link>
              </DropdownMenuItem>
            ))}

            <div className="text-gray-400 transition-colors flex flex-col">
              <Separator />
              <DropdownMenuItem>
                <Link
                  href="/author"
                  className="text-base font-medium transition-colors hover:text-primary my-1"
                >
                  Become an Author
                </Link>
              </DropdownMenuItem>

              <Separator />
              <DropdownMenuItem>
                <span className="text-base font-medium transition-colors hover:text-primary my-1">
                  <SignOutButton />
                </span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default UserProfileButton
