"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import LoadingPage from "@/components/LoadingPage";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { IoMenu } from "react-icons/io5";

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages that should render without admin layout
  const isStandalonePage = pathname === "/admin/login" || pathname === "/admin/unauthorized" || pathname === "/admin/forbidden" || pathname === "/admin/refresh-permissions";

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!isLoading && isAuthenticated && pathname === "/admin/login") {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  useEffect(() => {
    if (!isStandalonePage && !isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router, pathname, isStandalonePage]);

  // Render standalone pages without layout
  if (isStandalonePage) {
    return <>{children}</>;
  }

  // Show loading page while checking authentication
  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-950">
        <Toaster position="top-right" />
        
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Top Bar - Shows on all screens */}
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Content */}
        <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-24 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
