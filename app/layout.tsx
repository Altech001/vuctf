import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

import { Comfortaa as V0_Font_Comfortaa, Roboto_Mono as V0_Font_Roboto_Mono, Bitter as V0_Font_Bitter } from 'next/font/google'

// Initialize fonts
const _comfortaa = V0_Font_Comfortaa({ subsets: ['latin'], weight: ["300","400","500","600","700"] })
const _robotoMono = V0_Font_Roboto_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const _bitter = V0_Font_Bitter({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "VUCtf - Capture The Flag Platform",
  description: "Competitive cybersecurity challenges",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-mono antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
