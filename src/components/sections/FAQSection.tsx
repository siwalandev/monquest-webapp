"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFAQData();
  }, []);

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
    <section id="faq" className="py-20 px-4">
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
          {faqs.map((faq, index) => (
            <PixelCard key={index} glowColor="secondary">
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
