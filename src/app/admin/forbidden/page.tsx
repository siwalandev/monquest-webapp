"use client";

import { useRouter } from "next/navigation";
import { IoShieldCheckmark, IoArrowBack, IoHome, IoLockClosed } from "react-icons/io5";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 403 Icon & Text */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-orange-500/10 border-4 border-orange-500 rounded-lg mb-6 animate-pulse">
            <IoLockClosed className="text-7xl text-orange-500" />
          </div>
          
          <h1 className="text-8xl font-bold text-orange-500 mb-4 font-pixel tracking-wider">
            403
          </h1>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Permission Denied
          </h2>
          
          <p className="text-xl text-gray-400 mb-2">
            You don't have permission to access this resource.
          </p>
          <p className="text-gray-500">
            This area requires specific permissions that your account doesn't have.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4 text-left">
            <IoShieldCheckmark className="text-3xl text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Insufficient Permissions
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Your current role doesn't include the permissions needed to view or modify this resource.
              </p>
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <p className="text-xs text-gray-500 mb-2">Common reasons:</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• You need specific role permissions</li>
                  <li>• The resource is restricted to admins only</li>
                  <li>• Your account has limited access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 border-2 border-gray-600 hover:border-gray-500 flex items-center justify-center gap-2"
          >
            <IoArrowBack className="text-xl" />
            Go Back
          </button>
          
          <button
            onClick={() => router.push('/admin')}
            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 border-2 border-green-400 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2"
          >
            <IoHome className="text-xl" />
            Dashboard
          </button>
        </div>

        {/* Contact Info */}
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-sm text-gray-400">
            🔐 Need access? Contact your system administrator to request the necessary permissions for your account.
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
