"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { authFetch } from "@/lib/fetch";

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      console.log("[NotificationContext] Fetching unread count...");
      const response = await authFetch("/api/notifications?page=1&limit=1&unreadOnly=true");
      const result = await response.json();
      console.log("[NotificationContext] Response:", result);
      if (result.success) {
        console.log("[NotificationContext] Setting unread count to:", result.data.pagination.total);
        setUnreadCount(result.data.pagination.total);
      }
    } catch (error) {
      console.error("[NotificationContext] Refresh unread count error:", error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
