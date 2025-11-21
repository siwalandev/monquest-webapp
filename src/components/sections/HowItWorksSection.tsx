import PixelCard from "@/components/ui/PixelCard";
import { IoLink, IoCompass, IoHammer, IoArrowUp } from 'react-icons/io5';

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to access the game on Monad blockchain.",
      icon: <IoLink className="text-4xl" />,
    },
    {
      number: "2",
      title: "Choose Your Path",
      description: "Select your starting hero and receive your first tower NFTs.",
      icon: <IoCompass className="text-4xl" />,
    },
    {
      number: "3",
      title: "Build & Defend",
      description: "Place towers strategically and defend against monster waves.",
      icon: <IoHammer className="text-4xl" />,
    },
    {
      number: "4",
      title: "Earn & Upgrade",
      description: "Collect rewards, upgrade towers, and mint rare NFT items.",
      icon: <IoArrowUp className="text-4xl" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70 max-w-2xl mx-auto">
            Start your adventure in just 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative h-full">
              {/* Connector Line (hidden on mobile, shown on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-pixel-primary/30 -z-10" />
              )}

              <PixelCard glowColor="secondary" className="h-full">
                <div className="space-y-4 text-center flex flex-col h-full">
                  {/* Step Number */}
                  <div className="inline-block bg-pixel-primary text-pixel-darker font-pixel text-2xl w-12 h-12 flex items-center justify-center border-2 border-pixel-dark mx-auto">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center">{step.icon}</div>

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
