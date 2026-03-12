"use client"
import { Navigation } from "@/components/layout/Navigation"
import { HeroSection } from "@/components/marketing/HeroSection"
import { ProblemSection } from "@/components/marketing/ProblemSection"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { RetailersSection } from "@/components/marketing/RetailersSection"
import { TrustSection } from "@/components/marketing/TrustSection"
import { PackagingSection } from "@/components/marketing/PackagingSection"
import { PricingSection } from "@/components/marketing/PricingSection"
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection"
import { Footer } from "@/components/layout/Footer"

const HomePage = () => (
  <main className="min-h-screen">
    <Navigation />
    <HeroSection />
    <ProblemSection />
    <HowItWorks />
    <RetailersSection />
    <TrustSection />
    <PackagingSection />
    <PricingSection />
    <TestimonialsSection />
    <Footer />
  </main>
)

export default HomePage
