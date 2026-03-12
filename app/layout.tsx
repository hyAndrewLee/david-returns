import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { validateEnv } from "@/lib/env"
import { TRPCProvider } from "@/lib/trpc"

validateEnv()

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "David Returns - Return anything from your door in seconds",
  description:
    "David Returns picks up your online returns right from your doorstep. No boxes, no printers, no post office lines. Currently serving NYC.",
  keywords: ["returns", "pickup", "delivery", "NYC", "convenience", "shipping"],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "David Returns - Return anything from your door in seconds",
    description:
      "We pick up your online returns right from your doorstep. No boxes, no printers, no post office lines.",
    url: "https://davidreturns.com",
    siteName: "David Returns",
    images: [
      {
        url: "https://davidreturns.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "David Returns - Doorstep pickup for your online returns",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "David Returns - Return anything from your door in seconds",
    description:
      "We pick up your online returns right from your doorstep. No boxes, no printers, no post office lines.",
    images: ["https://davidreturns.com/og-image.jpg"],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en">
    <body className={`${geistSans.className} antialiased`}>
      <TRPCProvider>
        {children}
      </TRPCProvider>
      <Analytics />
    </body>
  </html>
)

export default RootLayout
