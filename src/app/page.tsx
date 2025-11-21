import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import RoadmapSection from "@/components/sections/RoadmapSection";
import FAQSection from "@/components/sections/FAQSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-pixel-darker">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RoadmapSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
