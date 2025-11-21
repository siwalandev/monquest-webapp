import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} font-pixel antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
