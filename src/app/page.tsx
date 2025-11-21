import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import RoadmapSection from "@/components/sections/RoadmapSection";
import FAQSection from "@/components/sections/FAQSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

// Fetch data on server
async function getContent() {
  try {
    const [heroContent, featuresContent, howItWorksContent] = await Promise.all([
      prisma.content.findUnique({
        where: { type: 'HERO' },
      }),
      prisma.content.findUnique({
        where: { type: 'FEATURES' },
      }),
      prisma.content.findUnique({
        where: { type: 'HOW_IT_WORKS' },
      }),
    ]);

    return {
      hero: heroContent?.data as any || null,
      features: featuresContent?.data as any || null,
      howItWorks: howItWorksContent?.data as any || null,
    };
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return {
      hero: null,
      features: null,
      howItWorks: null,
    };
  }
}

export default async function Home() {
  const content = await getContent();

  return (
    <main className="min-h-screen bg-pixel-darker">
      <Navbar />
      <HeroSection initialData={content.hero} />
      <FeaturesSection initialData={content.features} />
      <HowItWorksSection initialData={content.howItWorks} />
      <RoadmapSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
