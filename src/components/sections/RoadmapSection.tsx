"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";

export default function RoadmapSection() {
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      const response = await fetch("/api/public/content?type=ROADMAP");
      const result = await response.json();
      
      if (result.success && result.data) {
        setRoadmapData(result.data.data);
      }
    } catch (error) {
      console.error("Failed to load roadmap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const roadmapItems = roadmapData?.items || [];
  const title = roadmapData?.title || "Roadmap";
  const subtitle = roadmapData?.subtitle || "Our journey to build the ultimate tower defense game on Monad";

  const statusColors = {
    completed: "border-pixel-primary bg-pixel-primary/10",
    "in-progress": "border-pixel-secondary bg-pixel-secondary/10",
    upcoming: "border-pixel-accent bg-pixel-accent/10",
  };

  return (
    <section id="roadmap" className="py-20 px-4 bg-pixel-dark/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            {title}
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapItems.map((item, index) => (
            <PixelCard
              key={index}
              className={`${statusColors[item.status as keyof typeof statusColors]}`}
            >
              <div className="space-y-4">
                {/* Phase & Quarter */}
                <div className="space-y-1">
                  <div className="text-xs text-pixel-light/50">{item.phase}</div>
                  <div className="text-lg text-pixel-primary font-pixel">
                    {item.quarter}
                  </div>
                  <div className="text-base text-pixel-secondary font-pixel">
                    {item.title}
                  </div>
                </div>

                {/* Items */}
                <ul className="space-y-2 text-xs text-pixel-light/70">
                  {item.items.map((task, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  );
}
