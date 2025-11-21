import Link from "next/link";
import { IoHome } from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="bg-pixel-dark border-t-4 border-pixel-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl"><IoHome /></span>
              <span className="text-lg text-pixel-primary font-pixel">
                MONQUEST
              </span>
            </div>
            <p className="text-xs text-pixel-light/70 leading-relaxed">
              Epic pixel-art tower defense on Monad blockchain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm text-pixel-primary font-pixel mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-pixel-light/70">
              <li>
                <Link href="/#features" className="hover:text-pixel-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-pixel-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#roadmap" className="hover:text-pixel-primary transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-pixel-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm text-pixel-primary font-pixel mb-4">
              Community
            </h3>
            <ul className="space-y-2 text-xs text-pixel-light/70">
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Medium
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm text-pixel-primary font-pixel mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-xs text-pixel-light/70">
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pixel-primary transition-colors">
                  Audit
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-pixel-primary/30">
          <p className="text-center text-xs text-pixel-light/50">
            © 2025 Monquest. Built on Monad. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
