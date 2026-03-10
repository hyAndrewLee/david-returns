"use client"
import { Navigation } from "@/components/Navigation"
import { HeroSection } from "@/components/HeroSection"
import { ProblemSection } from "@/components/ProblemSection"
import { HowItWorks } from "@/components/HowItWorks"
import { RetailersSection } from "@/components/RetailersSection"
import { TrustSection } from "@/components/TrustSection"
import { PackagingSection } from "@/components/PackagingSection"
import { PricingSection } from "@/components/PricingSection"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import { Footer } from "@/components/Footer"

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
