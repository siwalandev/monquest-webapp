"use client";

import { useRouter } from "next/navigation";
import { IoHome, IoArrowBack, IoGameController } from "react-icons/io5";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Icon & Text */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center mb-6">
                        <IoGameController className="text-8xl text-red-500 animate-bounce" />
                    </div>

                    <h1 className="text-9xl font-bold text-green-500 mb-4 font-pixel tracking-wider animate-pulse">
                        404
                    </h1>

                    <h2 className="text-3xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-xl text-gray-400 mb-2">
                        Oops! This dungeon doesn't exist.
                    </p>
                    <p className="text-gray-500">
                        The page you're looking for has been slain by monsters or never existed.
                    </p>
                </div>

                {/* Pixel Art Decoration */}
                <div className="mb-8">
                    <div className="inline-block bg-gray-800 border-4 border-gray-700 rounded-lg p-6">
                        <pre className="text-green-500 font-mono text-xs sm:text-sm">
                            {`  _____                    
 |     |                   
 | 404 |  Quest Not Found! 
 |_____|                   
    |                      
   / \\                     `}
                        </pre>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 border-2 border-gray-600 hover:border-gray-500 flex items-center justify-center gap-2"
                    >
                        <IoArrowBack className="text-xl" />
                        Go Back
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 border-2 border-green-400 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                        <IoHome className="text-xl" />
                        Back to Home
                    </button>
                </div>

                {/* Fun Message */}
                <div className="mt-12 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400">
                        💡 <span className="text-green-400 font-semibold">Pro Tip:</span> Try checking the URL or return to the homepage to continue your adventure!
                    </p>
                </div>

                {/* Footer */}
                <p className="text-gray-600 text-sm mt-8">
                    © 2025 Monquest. All rights reserved.
                </p>
            </div>
        </div>
    );
}
