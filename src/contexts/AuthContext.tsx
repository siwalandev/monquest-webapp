"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'react-hot-toast';
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
  refreshUser: () => Promise<void>;
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
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when permissions change
  const router = useRouter();
  
  // Get current pathname to skip heavy operations on non-admin pages
  const [currentPath, setCurrentPath] = useState('');
  
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  
  // Privy hooks
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout, getAccessToken } = usePrivy();

  // Periodic role check to detect database changes
  useEffect(() => {
    // Skip polling for non-admin pages (404, landing page, etc)
    if (!currentPath.startsWith('/admin')) return;
    if (!isAuthenticated || !user) return;

    const checkRoleUpdate = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'x-user-id': user.id,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Check if role changed OR permissions changed
            const roleChanged = data.user.role.id !== user.role.id;
            const permissionsChanged = JSON.stringify(data.user.role.permissions.sort()) !== JSON.stringify(user.role.permissions.sort());
            
              if (roleChanged || permissionsChanged) {
                console.log('🔄 Permissions updated in database, refreshing...', {
                  roleChanged,
                  permissionsChanged,
                  oldPerms: user.role.permissions,
                  newPerms: data.user.role.permissions
                });
                // Update user data with new permissions
                setUser(data.user);
                localStorage.setItem("admin_user", JSON.stringify(data.user));
                toast.success('Your permissions have been updated!');
                // Force re-render all components
                setForceUpdate(prev => prev + 1);
                window.dispatchEvent(new Event('permissionsUpdated'));
                window.dispatchEvent(new Event('storage'));
              }
            }
          }
        } catch (error) {
          console.error('Failed to check role update:', error);
        }
      };

      // Check every 10 seconds for faster permission sync
      const interval = setInterval(checkRoleUpdate, 10000);
      return () => clearInterval(interval);
    }, [isAuthenticated, user, currentPath]);  // Auto-sync with Privy authentication on mount
  useEffect(() => {
    const syncAuth = async () => {
      // Skip auth checks for non-admin pages
      if (!currentPath.startsWith('/admin') && currentPath !== '') {
        setIsLoading(false);
        return;
      }
      
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
          
          // Set initial user data from localStorage
          setUser(userData);
          setIsAuthenticated(true);
          
          // Then fetch fresh data from database to check for updates
          try {
            const response = await fetch('/api/auth/me', {
              headers: { 'x-user-id': userData.id },
            });
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                // Check if role or permissions changed
                const roleChanged = data.user.role.id !== userData.role.id;
                const permissionsChanged = JSON.stringify(data.user.role.permissions.sort()) !== JSON.stringify(userData.role.permissions.sort());
                
                if (roleChanged) {
                  console.log('🔄 Role updated in database, applying changes...');
                  toast.success('Your role has been updated!');
                  // Force re-render on role change
                  setForceUpdate(prev => prev + 1);
                  window.dispatchEvent(new Event('permissionsUpdated'));
                } else if (permissionsChanged) {
                  console.log('🔄 Permissions updated in database, applying changes...', {
                    oldPerms: userData.role.permissions,
                    newPerms: data.user.role.permissions
                  });
                  toast.success('Your permissions have been updated!');
                  // Force re-render on permission change
                  setForceUpdate(prev => prev + 1);
                  window.dispatchEvent(new Event('permissionsUpdated'));
                }
                
                // Always update with fresh data
                setUser(data.user);
                localStorage.setItem("admin_user", JSON.stringify(data.user));
              }
            }
          } catch (error) {
            console.error('Failed to fetch fresh user data:', error);
          }
          
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
  }, [privyReady, privyAuthenticated, privyUser, getAccessToken, currentPath]);

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
        console.log('✅ Login successful:', {
          name: data.user.name,
          role: data.user.role.name,
          slug: data.user.role.slug,
          permissions: data.user.role.permissions,
          hasPanelAccess: data.user.role.permissions.includes('panel.access')
        });
        
        // Clear any old cached data first
        localStorage.removeItem("admin_user");
        
        // Set fresh user data
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        
        // Debug: set global variable for inspection
        (window as any).__MONQUEST_DEBUG_USER__ = data.user;
        
        // Force trigger permission update event
        setForceUpdate(prev => prev + 1);
        window.dispatchEvent(new Event('permissionsUpdated'));
        
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

  const refreshUser = async () => {
    if (!user) {
      console.warn('⚠️ No user to refresh');
      return;
    }
    
    try {
      console.log('🔄 Force refreshing user permissions...');
      const response = await fetch('/api/auth/me', {
        headers: { 'x-user-id': user.id }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          console.log('✅ User permissions refreshed:', {
            oldPermissions: user.role.permissions,
            newPermissions: data.user.role.permissions
          });
          setUser(data.user);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          // Force re-render all components that depend on permissions
          setForceUpdate(prev => prev + 1);
          window.dispatchEvent(new Event('permissionsUpdated'));
          // toast.success('Permissions refreshed!');
        }
      } else {
        console.error('❌ Failed to refresh user:', response.status);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
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
      refreshUser,
      hasPermission: (permission: string) => hasPermission(user as UserWithRole, permission),
      hasAnyPermission: (permissions: string[]) => hasAnyPermission(user as UserWithRole, permissions),
      hasAllPermissions: (permissions: string[]) => hasAllPermissions(user as UserWithRole, permissions),
      isSuperAdmin: () => isSuperAdmin(user as UserWithRole),
      isAdmin: () => hasPermission(user as UserWithRole, 'panel.access'),
      isRegularUser: () => !hasPermission(user as UserWithRole, 'panel.access'),
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
