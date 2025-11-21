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
  const glowStyles = {
    primary: "shadow-[0_0_20px_rgba(74,222,128,0.3)]",
    secondary: "shadow-[0_0_20px_rgba(96,165,250,0.3)]",
    accent: "shadow-[0_0_20px_rgba(251,146,60,0.3)]",
  };

  return (
    <div
      className={`
        bg-pixel-dark
        border-4 border-pixel-primary
        p-6
        ${glowStyles[glowColor]}
        hover:${glowStyles[glowColor].replace("0.3", "0.5")}
        transition-all
        duration-300
        pixel-borders
        ${className}
      `}
    >
      {children}
    </div>
  );
}
