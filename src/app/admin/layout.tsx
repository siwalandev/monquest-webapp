"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
    <div className="min-h-screen bg-gray-950">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-30 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-100 -ml-2"
          aria-label="Open menu"
        >
          <IoMenu className="text-2xl" />
        </button>
        
        <div className="flex-1 flex items-center justify-center">
          <span className="text-lg font-bold text-white">MONQUEST</span>
        </div>
        
        {/* User Avatar on Mobile */}
        {user && (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-green-500/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </header>
      
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-8 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
