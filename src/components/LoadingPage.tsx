"use client";

import { IoGameController } from "react-icons/io5";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 border-4 border-green-500 rounded-lg mb-6 animate-pulse">
            <IoGameController className="text-6xl text-green-500 animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            MONQUEST
          </h1>
          
          <p className="text-gray-400 mb-8">
            Loading your adventure...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-gray-500 mt-4 animate-pulse">
          Please wait...
        </p>
      </div>
    </div>
  );
}
