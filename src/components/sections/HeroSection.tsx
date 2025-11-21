import PixelButton from "@/components/ui/PixelButton";
import PixelIcon from "@/components/ui/PixelIcon";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-pixel-float">🏰</div>
        <div className="absolute top-40 right-20 text-6xl animate-pixel-float animation-delay-1000">⚔️</div>
        <div className="absolute bottom-40 left-20 text-6xl animate-pixel-float animation-delay-2000">🛡️</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-pixel-float animation-delay-1500">👾</div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Logo/Icon */}
        <PixelIcon size="lg" animate>
          🏰
        </PixelIcon>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-pixel-primary font-pixel leading-tight text-shadow-pixel">
          MONQUEST
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-pixel-secondary font-pixel leading-relaxed max-w-3xl mx-auto">
          Defend Your Kingdom in Epic Pixel-Art Tower Defense
        </p>

        {/* Description */}
        <p className="text-sm md:text-base text-pixel-light/70 leading-relaxed max-w-2xl mx-auto">
          Build towers, summon heroes, and conquer waves of monsters on the Monad blockchain.
          Earn NFTs, collect rare items, and climb the leaderboard in this play-to-earn adventure! 🎮
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <PixelButton size="lg" variant="primary">
            🎮 Play Now
          </PixelButton>
          <PixelButton size="lg" variant="secondary">
            📖 Learn More
          </PixelButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl text-pixel-primary font-pixel">
              1000+
            </div>
            <div className="text-xs text-pixel-light/70">Players</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl text-pixel-secondary font-pixel">
              50+
            </div>
            <div className="text-xs text-pixel-light/70">Unique Towers</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl text-pixel-accent font-pixel">
              100+
            </div>
            <div className="text-xs text-pixel-light/70">NFT Items</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl text-pixel-primary font-pixel">
              24/7
            </div>
            <div className="text-xs text-pixel-light/70">Online</div>
          </div>
        </div>
      </div>
    </section>
  );
}
