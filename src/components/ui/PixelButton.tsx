import { ButtonHTMLAttributes, ReactNode } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
}

export default function PixelButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: PixelButtonProps) {
  const variantStyles = {
    primary: "bg-pixel-primary text-pixel-darker hover:bg-green-400",
    secondary: "bg-pixel-secondary text-pixel-darker hover:bg-blue-400",
    accent: "bg-pixel-accent text-pixel-darker hover:bg-orange-400",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-pixel
        border-4 border-pixel-dark
        shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
        hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]
        hover:translate-x-[2px]
        hover:translate-y-[2px]
        active:shadow-none
        active:translate-x-[4px]
        active:translate-y-[4px]
        transition-all
        duration-100
        pixel-borders
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
