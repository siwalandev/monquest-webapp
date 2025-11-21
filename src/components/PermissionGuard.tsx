"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingPage from "@/components/LoadingPage";

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: string | string[];
  requireAll?: boolean;
  fallbackUrl?: string;
}

/**
 * PermissionGuard - Protect pages/components with permission check
 * 
 * @param permissions - Single permission or array of permissions required
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission (default: false)
 * @param fallbackUrl - Where to redirect if permission denied (default: /admin/forbidden)
 */
export default function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallbackUrl = "/admin/forbidden",
}: PermissionGuardProps) {
  const { isLoading, isAuthenticated, hasPermission, hasAllPermissions, hasAnyPermission, isAdmin } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [forceCheck, setForceCheck] = useState(0);

  // Listen for permission updates and re-check
  useEffect(() => {
    const handlePermissionUpdate = () => {
      console.log('🔄 PermissionGuard: Permissions updated, re-checking access...');
      hasRedirected.current = false; // Reset redirect flag
      setForceCheck(prev => prev + 1);
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionUpdate);
    return () => window.removeEventListener('permissionsUpdated', handlePermissionUpdate);
  }, []);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    // Wait for auth to load
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      console.log('🔒 PermissionGuard: Not authenticated, redirecting to login');
      hasRedirected.current = true;
      router.replace("/admin/login");
      return;
    }

    // Debug log user data
    console.log('🔍 PermissionGuard Debug:', {
      isAdmin: isAdmin(),
      hasPanelAccess: hasPermission("panel.access"),
      userPermissions: (window as any).__MONQUEST_DEBUG_USER__?.role?.permissions || []
    });

    // Not admin role - redirect to unauthorized
    if (!isAdmin()) {
      console.log('⛔ PermissionGuard: Not admin, redirecting to unauthorized');
      hasRedirected.current = true;
      router.replace("/admin/unauthorized");
      return;
    }

    // Check panel access first (required for all admin pages)
    if (!hasPermission("panel.access")) {
      console.log('⛔ PermissionGuard: No panel.access permission, redirecting to forbidden');
      hasRedirected.current = true;
      router.replace("/admin/forbidden");
      return;
    }

    // Check specific permissions
    const permArray = Array.isArray(permissions) ? permissions : [permissions];
    
    let hasAccess = false;
    if (requireAll) {
      hasAccess = hasAllPermissions(permArray);
    } else {
      hasAccess = hasAnyPermission(permArray);
    }

    // No permission - redirect to forbidden
    if (!hasAccess) {
      hasRedirected.current = true;
      router.replace(fallbackUrl);
    }
  }, [isLoading, isAuthenticated, permissions, requireAll, fallbackUrl, router, hasPermission, hasAllPermissions, hasAnyPermission, isAdmin, forceCheck]);

  // Show loading while checking (return null to prevent flash)
  if (isLoading) {
    return null;
  }

  // Not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Not admin (will redirect)
  if (!isAdmin()) {
    return null;
  }

  // Check permissions
  const permArray = Array.isArray(permissions) ? permissions : [permissions];
  let hasAccess = false;
  
  if (requireAll) {
    hasAccess = hasAllPermissions(permArray);
  } else {
    hasAccess = hasAnyPermission(permArray);
  }

  // No permission (will redirect)
  if (!hasAccess) {
    return null;
  }

  // All checks passed - render children
  return <>{children}</>;
}
