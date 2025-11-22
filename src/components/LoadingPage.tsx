"use client";

import { IoGameController } from "react-icons/io5";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pixel-darker via-pixel-dark to-pixel-darker flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-pixel-primary/10 border-4 border-pixel-primary rounded-lg mb-6 animate-pulse">
            <IoGameController className="text-6xl text-pixel-primary animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            MONQUEST
          </h1>
          
          <p className="text-pixel-light/70 mb-8">
            Loading your adventure...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-pixel-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-pixel-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pixel-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-pixel-dark rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-pixel-primary to-pixel-secondary animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-pixel-light/50 mt-4 animate-pulse">
          Please wait...
        </p>
      </div>
    </div>
  );
}
