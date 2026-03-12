import { Navigation } from "@/components/layout/Navigation"
import { HeroSection } from "@/components/marketing/HeroSection"
import { StatsSection } from "@/components/marketing/StatsSection"
import { SolutionSection } from "@/components/marketing/SolutionSection"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { BuildingsSection } from "@/components/marketing/BuildingsSection"
import { CarrierPartners } from "@/components/marketing/CarrierPartners"
import { ResidentsSection } from "@/components/marketing/ResidentsSection"
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection"
import { Footer } from "@/components/layout/Footer"

const HomePage = () => (
  <main className="min-h-screen">
    <Navigation />
    <HeroSection />
    <StatsSection />
    <SolutionSection />
    <HowItWorks />
    <BuildingsSection />
    <CarrierPartners />
    <ResidentsSection />
    <TestimonialsSection />
    <Footer />
  </main>
)

export default HomePage
