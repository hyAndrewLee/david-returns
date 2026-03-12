import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { validateEnv } from "@/lib/env"
import { TRPCProvider } from "@/lib/trpc"

validateEnv()

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })
const dmSerifDisplay = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "David Returns — Return Infrastructure for Apartment Buildings",
  description:
    "David Returns partners with apartment buildings across NYC to provide seamless return pickups for residents. No trips. No lines. No effort.",
  keywords: ["returns", "apartment buildings", "NYC", "pickup", "logistics", "property management", "tenant amenity"],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "David Returns — Return Infrastructure for Apartment Buildings",
    description:
      "David Returns partners with apartment buildings across NYC to provide seamless return pickups for residents.",
    url: "https://davidreturns.com",
    siteName: "David Returns",
    images: [
      {
        url: "https://davidreturns.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "David Returns — Return infrastructure for apartment living",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "David Returns — Return Infrastructure for Apartment Buildings",
    description:
      "David Returns partners with apartment buildings across NYC to provide seamless return pickups for residents.",
    images: ["https://davidreturns.com/og-image.jpg"],
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en">
    <body className={`${geistSans.className} ${dmSerifDisplay.variable} antialiased`}>
      <TRPCProvider>
        {children}
      </TRPCProvider>
      <Analytics />
    </body>
  </html>
)

export default RootLayout
