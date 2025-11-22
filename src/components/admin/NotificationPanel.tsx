"use client";

import { IoClose, IoCheckmarkCircle, IoInformationCircle, IoWarning, IoTrash, IoChevronBack, IoChevronForward, IoSearch } from "react-icons/io5";
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/fetch";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationChange?: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  onNotificationChange,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const limit = 5;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, page, searchInput]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        `/api/notifications?page=${page}&limit=${limit}&search=${searchInput}`
      );
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data.notifications);
        setTotalPages(result.data.pagination.totalPages);
        setTotal(result.data.pagination.total);
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await authFetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        // Trigger badge refresh
        onNotificationChange?.();
      }
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await authFetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotal((prev) => prev - 1);
        toast.success("Notification deleted");
        // Trigger badge refresh
        onNotificationChange?.();
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await authFetch("/api/notifications", {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications([]);
        setTotal(0);
        toast.success("All notifications cleared");
        // Trigger badge refresh
        onNotificationChange?.();
      }
    } catch (error) {
      console.error("Clear all error:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const handleNotificationClick = async (notification: Notification, e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons inside
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <IoCheckmarkCircle className="text-xl text-pixel-primary" />;
      case "WARNING":
        return <IoWarning className="text-xl text-yellow-400" />;
      case "ERROR":
        return <IoWarning className="text-xl text-red-400" />;
      default:
        return <IoInformationCircle className="text-xl text-pixel-secondary" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "bg-pixel-primary/10 border-pixel-primary/30";
      case "WARNING":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "ERROR":
        return "bg-red-500/10 border-red-500/30";
      default:
        return "bg-pixel-secondary/10 border-pixel-secondary/30";
    }
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 border-l-2 border-gray-800 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-[65px] border-b-2 border-gray-800">
          <h2 className="text-lg font-bold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 rounded"
            aria-label="Close notifications"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border-2 border-gray-700 text-white text-sm focus:border-pixel-primary focus:outline-none transition-colors duration-100"
            />
          </div>
        </div>

        {/* Actions Bar */}
        {total > 0 && (
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {unreadCount} unread • {total} total
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors duration-100"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-220px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-sm">Loading...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <IoInformationCircle className="text-6xl mb-4 opacity-20" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={(e) => handleNotificationClick(notification, e)}
                  className={`
                    p-4 border-2 transition-all duration-100 cursor-pointer
                    ${
                      notification.read
                        ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                        : `${getTypeColor(notification.type)} border-2 hover:brightness-110`
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`text-sm font-bold ${
                            notification.read ? "text-gray-400" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors duration-100"
                          aria-label="Delete notification"
                        >
                          <IoTrash className="text-sm" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-xs text-pixel-primary hover:brightness-110 font-medium transition-all duration-100"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t-2 border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IoChevronBack />
                Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <IoChevronForward />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
