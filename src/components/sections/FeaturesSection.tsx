import PixelCard from "@/components/ui/PixelCard";
import PixelIcon from "@/components/ui/PixelIcon";

export default function FeaturesSection() {
  const features = [
    {
      icon: "🏰",
      title: "Strategic Defense",
      description: "Build and upgrade towers with unique abilities. Plan your defense strategy carefully!",
      color: "primary" as const,
    },
    {
      icon: "⚔️",
      title: "Epic Battles",
      description: "Fight against waves of monsters with increasing difficulty. Boss battles await!",
      color: "secondary" as const,
    },
    {
      icon: "🎨",
      title: "Pixel-Art Beauty",
      description: "Stunning retro pixel-art graphics with smooth animations and vibrant colors.",
      color: "accent" as const,
    },
    {
      icon: "💎",
      title: "NFT Assets",
      description: "Own your towers, heroes, and items as NFTs. Trade on the marketplace!",
      color: "primary" as const,
    },
    {
      icon: "🏆",
      title: "Compete & Earn",
      description: "Climb the leaderboard and earn rewards. Play-to-earn on Monad blockchain.",
      color: "secondary" as const,
    },
    {
      icon: "🌏",
      title: "Nusantara Theme",
      description: "Explore archipelago-inspired maps with unique cultural elements and lore.",
      color: "accent" as const,
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-pixel-dark/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl text-pixel-primary font-pixel text-shadow-pixel">
            Game Features
          </h2>
          <p className="text-sm md:text-base text-pixel-light/70 max-w-2xl mx-auto">
            Experience the ultimate tower defense adventure with blockchain technology
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <PixelCard key={index} glowColor={feature.color}>
              <div className="space-y-4 text-center">
                <PixelIcon size="md">{feature.icon}</PixelIcon>
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
