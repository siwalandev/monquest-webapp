"use client";

import { useAuth } from "@/contexts/AuthContext";
import { IoNotifications, IoMenu } from "react-icons/io5";
import { useState, useEffect } from "react";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "@/contexts/NotificationContext";

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount, refreshUnreadCount } = useNotifications();

  // Fetch unread count on mount only (no polling)
  useEffect(() => {
    refreshUnreadCount();

    // Listen for notification creation events
    const handleNotificationCreated = () => {
      refreshUnreadCount();
    };

    window.addEventListener('notificationCreated', handleNotificationCreated);
    return () => {
      window.removeEventListener('notificationCreated', handleNotificationCreated);
    };
  }, [refreshUnreadCount]);

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
    <>
      <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-900 border-b-2 border-gray-800">
        <div className="flex items-center justify-between px-4 h-[64px]">
          {/* Left side - Menu button (mobile) or Admin Panel (desktop) */}
          <div className="flex items-center gap-3">
            {/* Menu button - Mobile only */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 rounded"
              aria-label="Open menu"
            >
              <IoMenu className="text-2xl" />
            </button>
            
            {/* Admin Panel label - Desktop only */}
            <div className="hidden lg:block text-sm font-medium text-gray-400">Admin Panel</div>
          </div>

          {/* Right side - Notifications & User Profile */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notification Button */}
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (!isNotificationOpen) {
                  refreshUnreadCount();
                }
              }}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 rounded"
              aria-label="Notifications"
            >
              <IoNotifications className="text-xl lg:text-2xl" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 lg:w-5 lg:h-5 bg-pixel-primary text-white text-[10px] lg:text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-gray-800">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-pixel-primary rounded-full flex items-center justify-center text-white font-bold text-[10px] lg:text-xs ring-2 ring-pixel-primary/30">
                {user?.name ? getInitials(user.name) : "U"}
              </div>
              <div className="hidden lg:block">
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
      
      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNotificationChange={refreshUnreadCount}
      />
    </>
  );
}
