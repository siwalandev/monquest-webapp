"use client";

import { useAuth } from "@/contexts/AuthContext";
import { IoNotifications } from "react-icons/io5";
import { useState } from "react";

export default function AdminTopBar() {
  const { user } = useAuth();
  const [notificationCount] = useState(3); // Example notification count

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayName = user?.walletAddress 
    ? truncateAddress(user.walletAddress)
    : user?.name || "User";

  const getRoleBadgeColor = (role: any) => {
    const slug = typeof role === 'string' ? role : role?.slug || '';
    
    switch (slug) {
      case "super_admin":
        return "bg-purple-500/20 text-purple-400";
      case "admin":
        return "bg-blue-500/20 text-blue-400";
      case "moderator":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getRoleLabel = (role: any) => {
    if (typeof role === 'string') {
      return role.replace('_', ' ');
    }
    
    const slug = role?.slug || '';
    switch (slug) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      default:
        return role?.name || "User";
    }
  };

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-900 border-b-2 border-gray-800">
      <div className="flex items-center justify-between px-6 h-[64px]">
        {/* Left side - Admin Panel Label */}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-400">Admin Panel</div>
        </div>

        {/* Right side - Notifications & User Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button
            className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 rounded"
            aria-label="Notifications"
          >
            <IoNotifications className="text-2xl" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-pixel-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
            <div className="w-8 h-8 bg-pixel-primary rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-pixel-primary/30">
              {user?.name ? getInitials(user.name) : "U"}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-white">
                {displayName}
              </div>
              {user?.role && (
                <span
                  className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
