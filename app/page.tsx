"use client"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { HowItWorks } from "@/components/how-it-works"
import { RetailersSection } from "@/components/retailers-section"
import { TrustSection } from "@/components/trust-section"
import { PackagingSection } from "@/components/packaging-section"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

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
