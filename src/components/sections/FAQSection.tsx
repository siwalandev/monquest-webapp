"use client";

import { useState } from "react";
import PixelCard from "@/components/ui/PixelCard";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Monquest?",
      answer:
        "Monquest is a pixel-art tower defense game built on Monad blockchain. Players build towers, defend against monsters, and earn NFT rewards while enjoying strategic gameplay.",
    },
    {
      question: "How do I start playing?",
      answer:
        "Simply connect your Web3 wallet (MetaMask, WalletConnect, etc.), mint your starter pack, and begin your adventure! The game guides you through the basics.",
    },
    {
      question: "What blockchain does Monquest use?",
      answer:
        "Monquest is built on Monad, a high-performance EVM-compatible blockchain. This ensures fast transactions and low fees for the best gaming experience.",
    },
    {
      question: "Can I earn money playing Monquest?",
      answer:
        "Yes! Monquest features play-to-earn mechanics. You can earn rewards, collect rare NFTs, and trade items on the marketplace. Top players also receive tournament prizes.",
    },
    {
      question: "Are the NFTs tradeable?",
      answer:
        "Absolutely! All towers, heroes, and items are NFTs that you truly own. Trade them on our marketplace or any compatible NFT platform.",
    },
    {
      question: "Is there a mobile version?",
      answer:
        "Mobile version is planned for Phase 3 (Q3 2025). Currently, Monquest is available as a web-based dApp accessible from desktop browsers.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            FAQ
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70">
            Got questions? We've got answers!
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
