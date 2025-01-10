"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useState } from "react"

export function AdminMainNav({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const params = useParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  let routes = []

  routes = [
    {
      href: `/author/${params.profileId}/${params.storyId}/profile`,
      label: "Profile",
      active:
        pathname === `/author/${params.profileId}/${params.storyId}/profile`,
    },
    {
      href: `/author/${params.profileId}/${params.storyId}/storySettings`,
      label: "Story Settings",
      active:
        pathname ===
        `/author/${params.profileId}/${params.storyId}/storySettings`,
    },
    {
      href: `/author/${params.profileId}/${params.storyId}/chapters`,
      label: "Chapters",
      active:
        pathname === `/author/${params.profileId}/${params.storyId}/chapters`,
    },
    {
      href: `/author/${params.profileId}/${params.storyId}/store`,
      label: "Store",
      active:
        pathname === `/author/${params.profileId}/${params.storyId}/store`,
    },
    {
      href: `/author/${params.profileId}/${params.storyId}/orders`,
      label: "Orders",
      active:
        pathname === `/author/${params.profileId}/${params.storyId}/orders`,
    },
  ]

  return (
    <div className="relative">
      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden">
        <DropdownMenu
          onOpenChange={(open) => {
            {
              /*Synchronize state with DropdownMenu which allows below icon switching that's consistent with Shadcn UI */
            }
            setIsMobileMenuOpen(open)
          }}
        >
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active
                      ? "text-black dark:text-white"
                      : "text-muted-foreground"
                  )}
                >
                  {route.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Navigation Links (Hidden on smaller screens) */}
      <nav className={cn("hidden md:flex items-center space-x-6", className)}>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
