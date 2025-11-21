"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { IoRefresh, IoCheckmarkCircle, IoWarning } from "react-icons/io5";
import toast from "react-hot-toast";

export default function RefreshPermissionsPage() {
  const router = useRouter();
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [permissionsBefore, setPermissionsBefore] = useState<string[]>([]);
  const [permissionsAfter, setPermissionsAfter] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setPermissionsBefore(user.role.permissions);
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Clear localStorage
      localStorage.removeItem("admin_user");
      
      // Refresh from database
      await refreshUser();
      
      // Get updated permissions
      const updatedUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      if (updatedUser.role) {
        setPermissionsAfter(updatedUser.role.permissions);
        toast.success("Permissions refreshed successfully!");
        
        // Redirect to admin after 2 seconds
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
      toast.error("Failed to refresh permissions");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogoutAndLogin = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 border-2 border-gray-800 p-8">
        <div className="text-center mb-8">
          <IoWarning className="text-6xl text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Permission Issue Detected
          </h1>
          <p className="text-gray-400">
            Your role permissions may have been updated. Please refresh to apply changes.
          </p>
        </div>

        {user && (
          <div className="bg-gray-800 border-2 border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Current User Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-green-400 font-medium">{user.role.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Permissions:</span>
                <span className="text-white">{permissionsBefore.length}</span>
              </div>
            </div>

            {permissionsBefore.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Current Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {permissionsBefore.map((perm) => (
                    <span
                      key={perm}
                      className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 border border-blue-500"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {permissionsAfter.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-green-400 mb-2">✓ Updated Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {permissionsAfter.map((perm) => (
                    <span
                      key={perm}
                      className={`text-xs px-2 py-1 border ${
                        !permissionsBefore.includes(perm)
                          ? "bg-green-500/20 text-green-400 border-green-500"
                          : "bg-gray-700 text-gray-400 border-gray-600"
                      }`}
                    >
                      {perm}
                      {!permissionsBefore.includes(perm) && " (NEW)"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <IoRefresh className="text-2xl animate-spin" />
                <span>Refreshing Permissions...</span>
              </>
            ) : (
              <>
                <IoRefresh className="text-2xl" />
                <span>Refresh Permissions</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogoutAndLogin}
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-all duration-100 border-2 border-gray-700"
          >
            Logout & Login Again
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-100"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 text-xs text-gray-500">
          <p className="mb-2">
            <strong className="text-gray-400">Why do I see this?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your administrator may have updated your role permissions</li>
            <li>Your browser cached old permission data</li>
            <li>A system update changed your access level</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
