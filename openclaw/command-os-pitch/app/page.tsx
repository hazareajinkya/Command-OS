import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import StarBackground from "@/components/StarBackground";
import StickyPricingBar from "@/components/StickyPricingBar";
import Testimonials from "@/components/Testimonials";
import UseCases from "@/components/UseCases";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarBackground />

      <main className="relative z-10">
        <Hero />
        <Pricing />
        <UseCases />
        <Testimonials />
      </main>

      <StickyPricingBar />
    </div>
  );
}
