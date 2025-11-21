"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin, UserWithRole } from "@/lib/permissions";

interface User {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    slug: string;
    permissions: string[];
    isSystem: boolean;
  };
  status: string;
  lastLogin?: Date;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("admin_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Validate user data structure - IMPORTANT: Check if role has new structure with permissions
        if (!userData.role || !userData.role.permissions || !Array.isArray(userData.role.permissions)) {
          console.warn("⚠️ User data uses old role format. Logging out and clearing cache...");
          console.warn("Please login again to get updated permissions.");
          localStorage.removeItem("admin_user");
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Show alert to user
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              alert("Your session has expired due to a system update. Please login again.");
              router.push("/admin/login");
            }, 100);
          }
          return;
        }
        
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, [router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("admin_user");
      router.push("/admin/login");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isLoading, 
      login, 
      logout,
      hasPermission: (permission: string) => hasPermission(user as UserWithRole, permission),
      hasAnyPermission: (permissions: string[]) => hasAnyPermission(user as UserWithRole, permissions),
      hasAllPermissions: (permissions: string[]) => hasAllPermissions(user as UserWithRole, permissions),
      isSuperAdmin: () => isSuperAdmin(user as UserWithRole),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
