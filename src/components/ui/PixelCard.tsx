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
  // Map glow colors to CSS variable names
  const glowVarMap = {
    primary: "--pixel-primary",
    secondary: "--pixel-secondary",
    accent: "--pixel-accent",
  };
  
  const glowVar = glowVarMap[glowColor];

  return (
    <div
      className={`
        bg-pixel-dark
        border-4 border-pixel-${glowColor}
        p-6
        transition-all
        duration-300
        pixel-borders
        ${className}
      `}
      style={{
        boxShadow: `0 0 20px color-mix(in srgb, var(${glowVar}) 30%, transparent)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px color-mix(in srgb, var(${glowVar}) 50%, transparent)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px color-mix(in srgb, var(${glowVar}) 30%, transparent)`;
      }}
    >
      {children}
    </div>
  );
}
