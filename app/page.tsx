import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { LogosStrip } from "@/components/marketing/logos-strip";
import { LivePreview } from "@/components/marketing/live-preview";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { Testimonials } from "@/components/marketing/testimonials";
import { Integrations } from "@/components/marketing/integrations";
import { FAQ } from "@/components/marketing/faq";
import { Pricing } from "@/components/marketing/pricing";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <LogosStrip />
      <LivePreview />
      <HowItWorks />
      <Features />
      <div id="professor-focus" />
      <Testimonials />
      <Integrations />
      <FAQ />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
