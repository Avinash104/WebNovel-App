import Footer from "@/app/(home)/components/footer"
import Navbar from "@/app/(home)/components/navbar"
import { createNewProfile } from "@/lib/create-new-profile"
import prismadb from "@/lib/prismadb"
import { currentUser } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import { Urbanist } from "next/font/google"

const font = Urbanist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Webnovel",
  description: "Homepage for Webnovels",
}

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (user) {
    const profile = await prismadb.profile.findUnique({
      where: {
        id: user?.id,
      },
    })
    if (!profile) {
      await createNewProfile(user?.id as string)
    }
  }

  return (
    <div className={font.className}>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
