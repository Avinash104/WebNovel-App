"use client"

import { useUser } from "@clerk/nextjs"
import { Heart, Home, Inbox, KeyboardIcon, Menu, Star, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"

const ProfileSidebar = () => {
  const { user } = useUser()

  const items = [
    { title: "Home", url: `/profile/${user?.id}/home`, icon: Home },
    { title: "Messages", url: `/profile/${user?.id}/messages`, icon: Inbox },
    { title: "Favorites", url: `/profile/${user?.id}/favorites`, icon: Heart },
    {
      title: "Reviews",
      url: `/profile/${user?.id}/reviews`,
      icon: KeyboardIcon,
    },
    {
      title: "Memberships",
      url: `/profile/${user?.id}/memberships`,
      icon: Star,
    },
  ]

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string | undefined>()
  const pathname = usePathname()

  useEffect(() => {
    const parts = pathname.split("/")
    setSelectedTab(parts[parts.length - 1])
  }, [pathname])

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col bg-slate-200 dark:bg-slate-800 h-screen w-64 p-4 shadow-lg rounded-r-lg">
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              aria-label={item.title}
              className={`flex items-center gap-4 p-3 rounded-md transition-all ${
                selectedTab === item.title.toLowerCase()
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setSelectedTab(item.title.toLowerCase())}
            >
              <item.icon className="h-5 w-5" />
              <span className="capitalize">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`top-0 left-0 h-screen transition-width duration-300 bg-slate-700 dark:bg-slate-900 ${
          isMobileMenuOpen ? "w-56" : "w-14"
        } md:hidden`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
          className="flex items-center justify-center p-4 text-white dark:text-gray-300 hover:bg-slate-600 dark:hover:bg-slate-700"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="space-y-2 mt-4">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              aria-label={item.title}
              className={`flex items-center gap-4 p-3 rounded-md transition-all ${
                selectedTab === item.title.toLowerCase()
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-transparent text-gray-300 dark:text-gray-400 hover:bg-gray-500 dark:hover:bg-gray-700"
              }`}
              onClick={() => setSelectedTab(item.title.toLowerCase())}
            >
              <item.icon className="h-5 w-5" />
              {isMobileMenuOpen && (
                <span className="capitalize">{item.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

export default ProfileSidebar
