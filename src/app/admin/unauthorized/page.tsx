"use client";

import { useRouter } from "next/navigation";
import { IoShieldCheckmarkOutline, IoHome } from "react-icons/io5";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 border-4 border-red-500 rounded-lg mb-4">
            <IoShieldCheckmarkOutline className="text-6xl text-red-500" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Access Denied
          </h1>
          
          <p className="text-xl text-gray-400">
            You don't have permission to access the admin panel
          </p>
        </div>

        {/* Message */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <p className="text-gray-300 mb-4">
            Your account doesn't have administrator privileges. Only users with admin roles can access this area.
          </p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin/refresh-permissions')}
            className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <IoShieldCheckmarkOutline className="text-xl" />
            Refresh My Permissions
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <IoHome className="text-xl" />
            Back to Home
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm mt-8">
          © 2025 Monquest. All rights reserved.
        </p>
      </div>
    </div>
  );
}
