import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Providers } from "./providers"
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
        {/* Material Symbols wird selbst gehostet (@font-face in globals.css),
            damit die App und die Berichts-Icons auch offline funktionieren. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/material-symbols-outlined.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header siteName="Lezio" />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer siteName="Lezio" />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}

export default RootLayout
