import Footer from "@/app/(home)/component/footer"
import Navbar from "@/app/(home)/component/navbar"
import type { Metadata } from "next"
import { Urbanist } from "next/font/google"

const font = Urbanist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Webnovel",
  description: "Homepage for Webnovels",
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={font.className}>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
