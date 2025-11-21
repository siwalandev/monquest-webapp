"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from '@privy-io/react-auth';
import { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin, UserWithRole } from "@/lib/permissions";

interface User {
  id: string;
  email: string | null;
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
  walletAddress?: string | null;
  authMethod: 'EMAIL' | 'WEB3' | 'HYBRID';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithWallet: (walletAddress: string, signature: string, message: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isRegularUser: () => boolean;
  // Privy authentication state
  privyReady: boolean;
  privyAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Privy hooks
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout, getAccessToken } = usePrivy();

  // Auto-sync with Privy authentication on mount
  useEffect(() => {
    const syncAuth = async () => {
      // First check localStorage
      const savedUser = localStorage.getItem("admin_user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          
          // Validate user data structure
          if (!userData.role || !userData.role.permissions || !Array.isArray(userData.role.permissions)) {
            console.warn("⚠️ User data uses old role format. Logging out and clearing cache...");
            localStorage.removeItem("admin_user");
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Failed to parse saved user:", error);
          localStorage.removeItem("admin_user");
        }
      }

      // If no saved user but Privy is authenticated, auto-login
      if (privyReady && privyAuthenticated && privyUser) {
        console.log("🔄 Auto-syncing Privy authentication...");
        
        try {
          // Get wallet address
          let walletAddress = privyUser.wallet?.address;
          if (!walletAddress && privyUser.linkedAccounts) {
            const walletAccount = privyUser.linkedAccounts.find(
              (account: any) => account.type === 'wallet'
            ) as any;
            walletAddress = walletAccount?.address;
          }

          if (walletAddress) {
            const accessToken = await getAccessToken();
            if (accessToken) {
              const message = `Sign in to Monquest Admin Panel\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
              
              // Auto-login with wallet
              const response = await fetch('/api/auth/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, signature: accessToken, message }),
              });

              const data = await response.json();
              if (data.success && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                localStorage.setItem("admin_user", JSON.stringify(data.user));
                console.log("✅ Auto-login successful");
              }
            }
          }
        } catch (error) {
          console.error("Auto-login error:", error);
        }
      }
      
      setIsLoading(false);
    };

    syncAuth();
  }, [privyReady, privyAuthenticated, privyUser, getAccessToken]);

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

  const loginWithWallet = async (walletAddress: string, signature: string, message: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, signature, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Wallet login failed' };
      }

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Wallet login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Logout from Privy if authenticated
      if (privyAuthenticated) {
        await privyLogout();
      }
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
      loginWithWallet,
      logout,
      hasPermission: (permission: string) => hasPermission(user as UserWithRole, permission),
      hasAnyPermission: (permissions: string[]) => hasAnyPermission(user as UserWithRole, permissions),
      hasAllPermissions: (permissions: string[]) => hasAllPermissions(user as UserWithRole, permissions),
      isSuperAdmin: () => isSuperAdmin(user as UserWithRole),
      isAdmin: () => user?.role?.slug !== 'user',
      isRegularUser: () => user?.role?.slug === 'user',
      privyReady,
      privyAuthenticated,
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
