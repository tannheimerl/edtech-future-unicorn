import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Providers } from "./providers"
import { FeedbackButton } from "@/components/shared/FeedbackButton"
import { Toaster } from "@/components/ui/Toaster"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Edtech Future Unicorn",
  description: "Lernziel-Tracking für Lehrkräfte",
}

const RootLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header siteName="Lezio" />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer siteName="Lezio" />
          <FeedbackButton />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}

export default RootLayout
