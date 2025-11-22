"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";

interface FAQItem {
  question: string;
  answer: string;
  color?: "primary" | "secondary" | "accent";
}

interface FAQData {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

interface FAQSectionProps {
  initialData?: FAQData | null;
}

export default function FAQSection({ initialData }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FAQData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // Only fetch if no initial data provided (client-side fallback)
    if (!initialData) {
      fetchFAQData();
    }
  }, [initialData]);

  const fetchFAQData = async () => {
    try {
      const response = await fetch("/api/public/content?type=FAQ");
      const result = await response.json();
      
      if (result.success && result.data) {
        setFaqData(result.data.data);
      }
    } catch (error) {
      console.error("Failed to load FAQ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = faqData?.items || [];
  const title = faqData?.title || "FAQ";
  const subtitle = faqData?.subtitle || "Got questions? We've got answers!";

  return (
    <section id="faq" className="py-20 px-4 bg-pixel-darker">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            {title}
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70">
            {subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq: FAQItem, index: number) => (
            <PixelCard key={index} glowColor={faq.color || "secondary"}>
              <button
                className="w-full text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm md:text-base text-pixel-primary font-pixel leading-relaxed">
                    {faq.question}
                  </h3>
                  <span className="text-pixel-secondary text-xl flex-shrink-0">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </div>
                {openIndex === index && (
                  <p className="mt-4 text-xs md:text-sm text-pixel-light/70 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </button>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  );
}
