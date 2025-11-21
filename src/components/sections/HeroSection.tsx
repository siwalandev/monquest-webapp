"use client";

import { useState, useEffect } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelIcon from "@/components/ui/PixelIcon";
import { IoGameController, IoBook, IoHome, IoShield, IoSkull } from 'react-icons/io5';

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: { text: string; icon: string };
  ctaSecondary: { text: string; icon: string };
  stats: { value: string; label: string }[];
}

interface HeroSectionProps {
  initialData?: HeroData | null;
}

export default function HeroSection({ initialData }: HeroSectionProps) {
  const [heroData, setHeroData] = useState<HeroData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // Only fetch if no initial data provided (client-side fallback)
    if (!initialData) {
      const fetchContent = async () => {
        try {
          const response = await fetch('/api/public/content');
          const result = await response.json();
          
          if (result.success && result.data.hero) {
            setHeroData(result.data.hero);
          }
        } catch (error) {
          console.error('Failed to fetch hero content:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchContent();
    }
  }, [initialData]);

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-pixel-light animate-pulse">Loading...</div>
      </section>
    );
  }

  if (!heroData) {
    return null;
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-pixel-float"><IoHome /></div>
        <div className="absolute top-40 right-20 text-6xl animate-pixel-float animation-delay-1000"><IoShield /></div>
        <div className="absolute bottom-40 left-20 text-6xl animate-pixel-float animation-delay-2000"><IoShield /></div>
        <div className="absolute bottom-20 right-10 text-6xl animate-pixel-float animation-delay-1500"><IoSkull /></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Logo/Icon */}
        <div className="text-6xl mb-4 animate-pixel-bounce">
          <IoHome className="inline-block" />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-pixel-primary font-pixel leading-tight text-shadow-pixel">
          {heroData.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-pixel-secondary font-pixel leading-relaxed max-w-3xl mx-auto">
          {heroData.subtitle}
        </p>

        {/* Description */}
        <p className="text-sm md:text-base text-pixel-light/70 leading-relaxed max-w-2xl mx-auto">
          {heroData.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <PixelButton size="lg" variant="primary">
            <IoGameController className="inline-block mr-2" /> {heroData.ctaPrimary.text}
          </PixelButton>
          <PixelButton size="lg" variant="secondary">
            <IoBook className="inline-block mr-2" /> {heroData.ctaSecondary.text}
          </PixelButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
          {heroData.stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className={`text-3xl md:text-4xl font-pixel ${
                index === 0 ? 'text-pixel-primary' :
                index === 1 ? 'text-pixel-secondary' :
                index === 2 ? 'text-pixel-accent' : 'text-pixel-primary'
              }`}>
                {stat.value}
              </div>
              <div className="text-xs text-pixel-light/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
