import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monquest pixel-art color palette - using CSS variables for dynamic theming
        pixel: {
          primary: "var(--pixel-primary)",
          secondary: "var(--pixel-secondary)",
          accent: "var(--pixel-accent)",
          dark: "var(--pixel-dark)",
          darker: "var(--pixel-darker)",
          light: "var(--pixel-light)",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"], // pixel font (install via Google Fonts nanti)
      },
      animation: {
        "pixel-float": "pixelFloat 3s ease-in-out infinite",
        "pixel-pulse": "pixelPulse 2s ease-in-out infinite",
        "fadeIn": "fadeIn 150ms ease-out",
        "scaleIn": "scaleIn 150ms ease-out",
      },
      keyframes: {
        pixelFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pixelPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
