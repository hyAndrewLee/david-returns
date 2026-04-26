import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Noto_Serif, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { validateEnv } from "@/lib/env"
import { TRPCProvider } from "@/lib/trpc"
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner"

validateEnv()

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const notoSerif = Noto_Serif({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-display" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://davidreturns.com"),
  title: "David Returns — Return Infrastructure for Apartment Buildings",
  description:
    "David Returns partners with apartment buildings across NYC to provide seamless return pickups for residents. No trips. No lines. No effort.",
  keywords: ["returns", "apartment buildings", "NYC", "pickup", "logistics", "property management", "tenant amenity"],
  alternates: {
    canonical: "/",
  },
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
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "David Returns — Return Infrastructure for Apartment Buildings",
    description:
      "David Returns partners with apartment buildings across NYC to provide seamless return pickups for residents.",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "David Returns",
  url: "https://davidreturns.com",
  logo: "https://davidreturns.com/images/david-returns-logo.png",
  description:
    "David Returns partners with apartment buildings across NYC to provide seamless return pickups for residents.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@davidreturns.com",
    telephone: "+1-706-308-8865",
    contactType: "customer service",
  },
  areaServed: {
    "@type": "City",
    name: "New York",
  },
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en">
    <body className={`${inter.variable} ${notoSerif.variable} ${geistMono.variable} antialiased`}>
      <script
        type="application/ld+json"
      >
        {JSON.stringify(organizationJsonLd)}
      </script>
      <TRPCProvider>
        <ImpersonationBanner />
        {children}
      </TRPCProvider>
      <Toaster position="bottom-right" richColors />
      <Analytics />
    </body>
  </html>
)

export default RootLayout
