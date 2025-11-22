import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import prisma from "@/lib/prisma";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Monquest - Monad Quest Tower Defense",
  description: "Epic pixel-art tower defense game on Monad blockchain. Defend, earn, and conquer!",
  keywords: ["monquest", "monad", "tower defense", "blockchain game", "web3", "nft"],
};

// Default theme colors (fallback)
const defaultColors = {
  primary: "#4ADE80",
  secondary: "#60A5FA", 
  accent: "#FB923C",
  dark: "#1F2937",
  darker: "#111827",
  light: "#F3F4F6"
};

// Fetch active theme from database (server-side)
async function getActiveTheme() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "active_theme_preset" }
    });

    if (setting?.value) {
      const presetSlug = typeof setting.value === 'string' 
        ? setting.value 
        : (setting.value as any).slug || 'default';
      
      const preset = await prisma.themePreset.findUnique({
        where: { slug: presetSlug }
      });

      if (preset?.colors) {
        return preset.colors as Record<string, string>;
      }
    }
  } catch (error) {
    console.error('Failed to fetch active theme:', error);
  }
  
  return defaultColors;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeColors = await getActiveTheme();

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `:root {
            --pixel-primary: ${themeColors.primary};
            --pixel-secondary: ${themeColors.secondary};
            --pixel-accent: ${themeColors.accent};
            --pixel-dark: ${themeColors.dark};
            --pixel-darker: ${themeColors.darker};
            --pixel-light: ${themeColors.light};
          }`
        }} />
      </head>
      <body className={`${pixelFont.variable} font-pixel antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
