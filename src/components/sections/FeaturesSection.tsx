"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";
import PixelIcon from "@/components/ui/PixelIcon";
import * as Icons from 'react-icons/io5';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: "primary" | "secondary" | "accent";
}

interface FeaturesData {
  title: string;
  subtitle: string;
  items: Feature[];
}

interface FeaturesSectionProps {
  initialData?: FeaturesData | null;
}

export default function FeaturesSection({ initialData }: FeaturesSectionProps) {
  const [featuresData, setFeaturesData] = useState<FeaturesData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // Only fetch if no initial data provided (client-side fallback)
    if (!initialData) {
      const fetchContent = async () => {
        try {
          const response = await fetch('/api/public/content');
          const result = await response.json();
          
          if (result.success && result.data.features) {
            setFeaturesData(result.data.features);
          }
        } catch (error) {
          console.error('Failed to fetch features content:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchContent();
    }
  }, [initialData]);

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon /> : <Icons.IoHome />;
  };

  if (isLoading) {
    return (
      <section id="features" className="py-20 px-4 bg-pixel-dark">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-pixel-light animate-pulse">Loading features...</div>
        </div>
      </section>
    );
  }

  if (!featuresData) {
    return null;
  }

  return (
    <section id="features" className="py-20 px-4 bg-pixel-dark">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            {featuresData.title}
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70 max-w-2xl mx-auto">
            {featuresData.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.items.map((feature) => (
            <PixelCard key={feature.id} glowColor={feature.color}>
              <div className="space-y-4 text-center">
                <div className="text-4xl flex justify-center mb-2">{getIcon(feature.icon)}</div>
                <h3 className="text-lg text-pixel-primary font-pixel">
                  {feature.title}
                </h3>
                <p className="text-xs text-pixel-light/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  );
}
