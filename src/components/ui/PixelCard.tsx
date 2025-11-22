import { ReactNode } from "react";

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "secondary" | "accent";
}

export default function PixelCard({
  children,
  className = "",
  glowColor = "primary",
}: PixelCardProps) {
  // Map glow colors to CSS variable names and border classes
  const colorConfig = {
    primary: {
      cssVar: "--pixel-primary",
      borderClass: "border-pixel-primary",
    },
    secondary: {
      cssVar: "--pixel-secondary",
      borderClass: "border-pixel-secondary",
    },
    accent: {
      cssVar: "--pixel-accent",
      borderClass: "border-pixel-accent",
    },
  };
  
  const config = colorConfig[glowColor];

  return (
    <div
      className={`
        bg-pixel-dark
        border-4 ${config.borderClass}
        p-6
        transition-all
        duration-300
        pixel-borders
        ${className}
      `}
      style={{
        boxShadow: `0 0 20px color-mix(in srgb, var(${config.cssVar}) 30%, transparent)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px color-mix(in srgb, var(${config.cssVar}) 50%, transparent)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px color-mix(in srgb, var(${config.cssVar}) 30%, transparent)`;
      }}
    >
      {children}
    </div>
  );
}
