"use client";

import Link from "next/link";
import { useState } from "react";
import WalletConnectButton from "@/components/WalletConnectButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-pixel-darker/95 backdrop-blur-sm border-b-4 border-pixel-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-4xl animate-pixel-float">🏰</div>
            <span className="text-xl text-pixel-primary font-pixel group-hover:text-pixel-secondary transition-colors">
              MONQUEST
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm text-pixel-light hover:text-pixel-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-pixel-light hover:text-pixel-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#roadmap"
              className="text-sm text-pixel-light hover:text-pixel-primary transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="/#faq"
              className="text-sm text-pixel-light hover:text-pixel-primary transition-colors"
            >
              FAQ
            </Link>
            <WalletConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-pixel-primary text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/#features"
              className="block text-sm text-pixel-light hover:text-pixel-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="block text-sm text-pixel-light hover:text-pixel-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#roadmap"
              className="block text-sm text-pixel-light hover:text-pixel-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Roadmap
            </Link>
            <Link
              href="/#faq"
              className="block text-sm text-pixel-light hover:text-pixel-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <WalletConnectButton />
          </div>
        )}
      </div>
    </nav>
  );
}
