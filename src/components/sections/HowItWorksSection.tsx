"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";
import * as Icons from 'react-icons/io5';

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
}

interface HowItWorksData {
  title: string;
  subtitle: string;
  steps: Step[];
}

interface HowItWorksSectionProps {
  initialData?: HowItWorksData | null;
}

export default function HowItWorksSection({ initialData }: HowItWorksSectionProps) {
  const [howItWorksData, setHowItWorksData] = useState<HowItWorksData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // Only fetch if no initial data provided (client-side fallback)
    if (!initialData) {
      const fetchContent = async () => {
        try {
          const response = await fetch('/api/public/content');
          const result = await response.json();
          
          if (result.success && result.data.howItWorks) {
            setHowItWorksData(result.data.howItWorks);
          }
        } catch (error) {
          console.error('Failed to fetch how it works content:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchContent();
    }
  }, [initialData]);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="text-4xl" /> : <Icons.IoLink className="text-4xl" />;
  };

  if (isLoading) {
    return (
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-pixel-light animate-pulse">Loading steps...</div>
        </div>
      </section>
    );
  }

  if (!howItWorksData) {
    return null;
  }

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            {howItWorksData.title}
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70 max-w-2xl mx-auto">
            {howItWorksData.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksData.steps.map((step, index) => (
            <div key={step.id} className="relative h-full">
              {/* Connector Line (hidden on mobile, shown on desktop) */}
              {index < howItWorksData.steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-pixel-primary/30 -z-10" />
              )}

              <PixelCard glowColor="secondary" className="h-full">
                <div className="space-y-4 text-center flex flex-col h-full">
                  {/* Step Number */}
                  <div className="inline-block bg-pixel-primary text-pixel-darker font-pixel text-2xl w-12 h-12 flex items-center justify-center border-2 border-pixel-dark mx-auto">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center">{getIcon(step.icon)}</div>

                  {/* Title */}
                  <h3 className="text-base text-pixel-primary font-pixel">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-pixel-light/70 leading-relaxed flex-grow">
                    {step.description}
                  </p>
                </div>
              </PixelCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
