import { TooltipProvider } from "@/components/ui/tooltip"
import { ModalProvider } from "@/providers/modal-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Dashboard for authors",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="top-0 max-w-7xl mx-auto px-[0.5px] md:px-8">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
            >
              <TooltipProvider>
                <Toaster />
                <ModalProvider />
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
