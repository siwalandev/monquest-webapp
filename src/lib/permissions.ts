// Permission constants (must match seed.ts and permissions API)
export const PERMISSIONS = {
  users: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "users.manage_roles",
  ],
  roles: [
    "roles.view",
    "roles.create",
    "roles.edit",
    "roles.delete",
    "roles.assign",
  ],
  content: [
    "content.view",
    "content.create",
    "content.edit",
    "content.delete",
  ],
  media: [
    "media.view",
    "media.upload",
    "media.delete",
  ],
  apiKeys: [
    "apiKeys.view",
    "apiKeys.create",
    "apiKeys.delete",
  ],
  settings: [
    "settings.view",
    "settings.edit",
  ],
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat();

// User type with role
export interface UserWithRole {
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

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserWithRole | null, permission: string): boolean {
  if (!user || !user.role) return false;
  return user.role.permissions.includes(permission);
}

/**
 * Check if user has at least one of the specified permissions
 */
export function hasAnyPermission(user: UserWithRole | null, permissions: string[]): boolean {
  if (!user || !user.role) return false;
  return permissions.some(permission => user.role.permissions.includes(permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(user: UserWithRole | null, permissions: string[]): boolean {
  if (!user || !user.role) return false;
  return permissions.every(permission => user.role.permissions.includes(permission));
}

/**
 * Check if user is super admin (has all permissions)
 */
export function isSuperAdmin(user: UserWithRole | null): boolean {
  if (!user || !user.role) return false;
  return user.role.slug === "super_admin";
}

/**
 * Check if user can manage a specific role
 * Super admin can manage all roles
 * Others cannot manage system roles
 */
export function canManageRole(user: UserWithRole | null, targetRole: { isSystem: boolean }): boolean {
  if (!user) return false;
  
  // Super admin can manage all roles
  if (isSuperAdmin(user)) return true;
  
  // Others cannot manage system roles
  if (targetRole.isSystem) return false;
  
  // Check if user has role management permission
  return hasPermission(user, "roles.edit");
}

/**
 * Check if user can delete a specific role
 */
export function canDeleteRole(user: UserWithRole | null, targetRole: { isSystem: boolean }): boolean {
  if (!user) return false;
  
  // Cannot delete system roles
  if (targetRole.isSystem) return false;
  
  // Need both roles.delete permission and super admin
  return isSuperAdmin(user) && hasPermission(user, "roles.delete");
}

/**
 * Check if user can manage another user
 * Super admin can manage all users
 * Others cannot manage super admin users
 */
export function canManageUser(currentUser: UserWithRole | null, targetUser: UserWithRole): boolean {
  if (!currentUser) return false;
  
  // Super admin can manage all users
  if (isSuperAdmin(currentUser)) return true;
  
  // Others cannot manage super admin users
  if (targetUser.role.slug === "super_admin") return false;
  
  return hasPermission(currentUser, "users.edit");
}
