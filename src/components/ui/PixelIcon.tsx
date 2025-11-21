interface PixelIconProps {
  children: string; // emoji or text
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export default function PixelIcon({
  children,
  size = "md",
  animate = false,
}: PixelIconProps) {
  const sizeStyles = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${animate ? "animate-pixel-float" : ""}
        pixel-borders
        inline-block
      `}
    >
      {children}
    </div>
  );
}
