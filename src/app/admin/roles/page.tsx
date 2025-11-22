"use client";

import { useState, useEffect } from "react";
import { ServerDataTable } from "@/components/ui/ServerDataTable";
import { ColumnDef } from "@tanstack/react-table";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Accordion from "@/components/ui/Accordion";
import PermissionGuard from "@/components/PermissionGuard";
import { authFetch } from "@/lib/fetch";
import {
  IoAdd,
  IoTrash,
  IoEye,
  IoPencil,
  IoShieldCheckmark,
  IoPeople,
  IoCheckmarkCircle,
  IoCreate,
} from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
  };
}

interface PermissionCategory {
  category: string;
  permissions: Array<{
    key: string;
    label: string;
    description: string;
  }>;
}

interface RoleStats {
  total: number;
  system: number;
  custom: number;
  totalUsers: number;
}

export default function RolesPage() {
  const { hasPermission, isSuperAdmin, refreshUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [, forceUpdate] = useState(0);

  // Listen for permission updates
  useEffect(() => {
    const handlePermissionUpdate = () => {
      console.log('🔄 RolesPage: Permissions updated, refreshing data...');
      forceUpdate(prev => prev + 1);
      setRefreshKey(k => k + 1);
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionUpdate);
    return () => window.removeEventListener('permissionsUpdated', handlePermissionUpdate);
  }, []);

  // Modal states
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({ isOpen: false, role: null });
  const [allRoles, setAllRoles] = useState<Role[]>([]);

  // Check permissions
  const canView = hasPermission("roles.view");
  const canCreate = hasPermission("roles.create");
  const canEdit = hasPermission("roles.edit");
  const canDelete = hasPermission("roles.delete") && isSuperAdmin();

  useEffect(() => {
    fetchStats();
    fetchPermissions();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      // Fetch all roles for stats
      const response = await authFetch("/api/roles?includeSystem=true&limit=1000");
      const result = await response.json();

      if (result.roles) {
        const roles = result.roles;
        const systemRoles = roles.filter((r: Role) => r.isSystem);
        const customRoles = roles.filter((r: Role) => !r.isSystem);
        const totalUsers = roles.reduce((sum: number, r: Role) => sum + r._count.users, 0);

        setStats({
          total: roles.length,
          system: systemRoles.length,
          custom: customRoles.length,
          totalUsers,
        });
        
        setAllRoles(roles);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await authFetch("/api/roles/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");

      const data = await response.json();
      setPermissionCategories(data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  // DataTable columns
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-white">{row.original.name}</div>
          {row.original.description && (
            <div className="text-xs text-gray-500 mt-1">{row.original.description}</div>
          )}
          <code className="text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 border border-cyan-500/30 mt-1 inline-block">
            {row.original.slug}
          </code>
        </div>
      ),
    },
    {
      accessorKey: "_count.users",
      header: "Users",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm bg-blue-500/20 text-blue-400 px-2 py-1 border border-blue-500">
          <IoPeople />
          {row.original._count.users}
        </span>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm bg-green-500/20 text-green-400 px-2 py-1 border border-green-500">
          <IoShieldCheckmark />
          {row.original.permissions.length}
        </span>
      ),
    },
    {
      accessorKey: "isSystem",
      header: "Type",
      cell: ({ row }) =>
        row.original.isSystem ? (
          <span className="inline-block text-xs bg-green-500/20 text-green-400 px-2 py-1 border border-green-500 font-medium">
            SYSTEM
          </span>
        ) : (
          <span className="inline-block text-xs bg-purple-500/20 text-purple-400 px-2 py-1 border border-purple-500 font-medium">
            CUSTOM
          </span>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-gray-400 text-sm">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isProtected = row.original.isSystem;
        
        return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row.original)}
            className="p-2 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-100"
            title="View permissions"
          >
            <IoEye className="text-lg" />
          </button>
          {canEdit && (
            <button
              onClick={() => !isProtected && handleEdit(row.original)}
              disabled={isProtected}
              className={`p-2 transition-all duration-100 ${
                isProtected
                  ? "text-gray-600 cursor-not-allowed opacity-40"
                  : "text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
              }`}
              title={isProtected ? "System roles cannot be edited" : "Edit role"}
            >
              <IoCreate className="text-lg" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => !isProtected && setDeleteConfirm({ isOpen: true, role: row.original })}
              disabled={isProtected}
              className={`p-2 transition-all duration-100 ${
                isProtected
                  ? "text-gray-600 cursor-not-allowed opacity-40"
                  : "text-red-400 hover:bg-red-500/10 hover:text-red-300"
              }`}
              title={isProtected ? "System roles cannot be deleted" : "Delete role"}
            >
              <IoTrash className="text-lg" />
            </button>
          )}
        </div>
      );},
    },
  ];

  // Handlers
  const handleView = (role: Role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleDeleteConfirm = async (targetRoleId?: string) => {
    if (!deleteConfirm.role) return;

    try {
      const response = await authFetch(`/api/roles/${deleteConfirm.role.id}`, {
        method: "DELETE",
        body: JSON.stringify({ targetRoleId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete role");
      }

      toast.success("Role deleted successfully!");
      setRefreshKey((k) => k + 1);
      setDeleteConfirm({ isOpen: false, role: null });
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(error.message || "Failed to delete role");
    }
  };

  return (
    <PermissionGuard permissions="roles.view">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl text-white font-bold mb-2">Role Management</h1>
          <p className="text-sm text-gray-400">Manage roles and permissions</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100"
          >
            <IoAdd className="text-xl" />
            Add Role
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoShieldCheckmark className="text-2xl text-gray-400" />
              <div className="text-sm text-gray-400">Total Roles</div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>

          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoCheckmarkCircle className="text-2xl text-green-400" />
              <div className="text-sm text-gray-400">System Roles</div>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.system}</div>
          </div>

          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoShieldCheckmark className="text-2xl text-purple-400" />
              <div className="text-sm text-gray-400">Custom Roles</div>
            </div>
            <div className="text-2xl font-bold text-purple-400">{stats.custom}</div>
          </div>

          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoPeople className="text-2xl text-blue-400" />
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
          </div>
        </div>
      )}

      {/* DataTable */}
      <ServerDataTable
        columns={columns}
        fetchUrl="/api/roles"
        searchPlaceholder="Search by name, slug, or description..."
        onRefresh={() => setRefreshKey((k) => k + 1)}
        refreshTrigger={refreshKey}
      />

      {/* View Permissions Modal */}
      <ViewPermissionsModal
        role={selectedRole}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRole(null);
        }}
        permissionCategories={permissionCategories}
      />

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        permissionCategories={permissionCategories}
        onSuccess={() => {
          setRefreshKey((k) => k + 1);
          setShowAddModal(false);
        }}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        role={selectedRole}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        permissionCategories={permissionCategories}
        refreshUserData={refreshUser}
        onSuccess={(updatedRole) => {
          // Update selectedRole dengan data terbaru
          setSelectedRole(updatedRole);
          // Refresh datatable dan stats
          setRefreshKey((k) => k + 1);
          fetchStats();
          // Trigger force update untuk re-render semua komponen
          forceUpdate((prev: number) => prev + 1);
        }}
      />

      {/* Delete Confirmation */}
      {deleteConfirm.role && (
        <DeleteRoleConfirmModal
          role={deleteConfirm.role}
          isOpen={deleteConfirm.isOpen}
          allRoles={allRoles.filter((r) => r.id !== deleteConfirm.role?.id)}
          onClose={() => setDeleteConfirm({ isOpen: false, role: null })}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
    </PermissionGuard>
  );
}

// ======================================================================
// MODAL COMPONENTS
// ======================================================================

// View Permissions Modal
function ViewPermissionsModal({
  role,
  isOpen,
  onClose,
  permissionCategories,
}: {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  permissionCategories: PermissionCategory[];
}) {
  const [currentRole, setCurrentRole] = useState<Role | null>(role);

  // Update local state when role prop changes
  useEffect(() => {
    if (role && isOpen) {
      setCurrentRole(role);
    }
  }, [role, isOpen]);

  if (!currentRole) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${currentRole.name} Permissions`} size="lg">
      <div className="space-y-4">
        {/* Role Info */}
        <div className="bg-gray-800/50 border-2 border-gray-700 p-4 space-y-2">
          {currentRole.description && (
            <p className="text-gray-300 text-sm">{currentRole.description}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 border border-blue-500">
              <IoPeople className="inline mr-1" />
              {currentRole._count.users} users
            </span>
            {currentRole.isSystem && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 border border-green-500">
                SYSTEM ROLE
              </span>
            )}
            <code className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 border border-cyan-500/30">
              {currentRole.slug}
            </code>
          </div>
        </div>

        {/* Permissions by Category */}
        {permissionCategories.map((category) => {
          const categoryPermissions = category.permissions.filter((p) =>
            currentRole.permissions.includes(p.key)
          );

          if (categoryPermissions.length === 0) return null;

          return (
            <div key={category.category} className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {category.category}
              </h3>
              <div className="space-y-1">
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.key}
                    className="flex items-start gap-2 text-sm text-gray-300 bg-gray-800/50 p-3 border border-gray-700"
                  >
                    <IoShieldCheckmark className="text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{permission.label}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {currentRole.permissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No permissions assigned</div>
        )}
      </div>
    </Modal>
  );
}

// Add Role Modal
function AddRoleModal({
  isOpen,
  onClose,
  permissionCategories,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  permissionCategories: PermissionCategory[];
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-generate slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const toggleCategoryPermissions = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryPermissions.includes(p)));
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...categoryPermissions.filter((p) => !prev.includes(p)),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);

    try {
      const response = await authFetch("/api/roles", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          slug,
          description: description.trim() || null,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create role");
      }

      toast.success("Role created successfully!");
      setName("");
      setDescription("");
      setSelectedPermissions([]);
      onSuccess();
      
      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast.error(error.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  // Build accordion items
  const accordionItems = permissionCategories.map((category) => {
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    const allCategorySelected = categoryPermissionKeys.every((p) =>
      selectedPermissions.includes(p)
    );

    return {
      id: category.category,
      title: category.category.toUpperCase(),
      icon: <IoShieldCheckmark />,
      content: (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => toggleCategoryPermissions(categoryPermissionKeys)}
            className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 border border-green-500 hover:bg-green-500/30 transition-all duration-100"
          >
            {allCategorySelected ? "Deselect All" : "Select All"}
          </button>

          <div className="grid grid-cols-1 gap-2">
            {category.permissions.map((permission) => (
              <label
                key={permission.key}
                className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-all duration-100 ${
                  selectedPermissions.includes(permission.key)
                    ? "bg-green-500/10 border-green-500"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.key)}
                  onChange={() => togglePermission(permission.key)}
                  className="mt-1 w-4 h-4 accent-green-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{permission.label}</div>
                  <div className="text-xs text-gray-400">{permission.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ),
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Role"
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-100 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Role"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Content Editor"
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pixel-primary transition-colors duration-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Slug (auto-generated)
            </label>
            <code className="block px-4 py-2 bg-gray-800/50 border-2 border-gray-700 text-cyan-400 text-sm">
              {slug || "role-slug"}
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role"
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pixel-primary transition-colors duration-100 resize-none"
            />
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Permissions *</h3>
            <p className="text-sm text-gray-400 mt-1">
              Selected: {selectedPermissions.length} permission(s)
            </p>
          </div>

          <Accordion items={accordionItems} defaultOpen={[]} allowMultiple={true} />
        </div>
      </form>
    </Modal>
  );
}

// Edit Role Modal
function EditRoleModal({
  role,
  isOpen,
  onClose,
  permissionCategories,
  refreshUserData,
  onSuccess,
}: {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  permissionCategories: PermissionCategory[];
  refreshUserData: () => Promise<void>;
  onSuccess: (updatedRole: Role) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
      setSelectedPermissions(role.permissions);
    }
  }, [role]);

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const toggleCategoryPermissions = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryPermissions.includes(p)));
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...categoryPermissions.filter((p) => !prev.includes(p)),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return;

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);

    try {
      const response = await authFetch(`/api/roles/${role.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: role.isSystem ? undefined : name.trim(),
          description: role.isSystem ? undefined : description.trim() || null,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      const data = await response.json();
      toast.success("Role updated successfully!");
      
      // Immediately refresh current user permissions
      await refreshUserData();
      
      // Clear localStorage to force fresh permission check
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      
      // Pass updated role data to parent and close modal
      onSuccess(data.data);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  // Build accordion items
  const accordionItems = permissionCategories.map((category) => {
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    const allCategorySelected = categoryPermissionKeys.every((p) =>
      selectedPermissions.includes(p)
    );

    return {
      id: category.category,
      title: category.category.toUpperCase(),
      icon: <IoShieldCheckmark />,
      content: (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => toggleCategoryPermissions(categoryPermissionKeys)}
            className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 border border-green-500 hover:bg-green-500/30 transition-all duration-100"
          >
            {allCategorySelected ? "Deselect All" : "Select All"}
          </button>

          <div className="grid grid-cols-1 gap-2">
            {category.permissions.map((permission) => (
              <label
                key={permission.key}
                className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-all duration-100 ${
                  selectedPermissions.includes(permission.key)
                    ? "bg-green-500/10 border-green-500"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.key)}
                  onChange={() => togglePermission(permission.key)}
                  className="mt-1 w-4 h-4 min-w-[16px] accent-green-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white break-words">{permission.label}</div>
                  <div className="text-xs text-gray-400 break-words">{permission.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ),
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Role: ${role.name}`}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-100 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {role.isSystem && (
          <div className="bg-yellow-500/10 border-2 border-yellow-500 p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ System role - only permissions can be modified
            </p>
          </div>
        )}

        {/* Basic Info (disabled for system roles) */}
        {!role.isSystem && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-pixel-primary transition-colors duration-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Slug (cannot be changed)
              </label>
              <code className="block px-4 py-2 bg-gray-800/50 border-2 border-gray-700 text-cyan-400 text-sm">
                {role.slug}
              </code>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pixel-primary transition-colors duration-100 resize-none"
              />
            </div>
          </div>
        )}

        {/* Permissions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Permissions *</h3>
            <p className="text-sm text-gray-400 mt-1">
              Selected: {selectedPermissions.length} permission(s)
            </p>
          </div>

          <Accordion items={accordionItems} defaultOpen={[]} allowMultiple={true} />
        </div>
      </form>
    </Modal>
  );
}

// Delete Role Confirmation Modal
function DeleteRoleConfirmModal({
  role,
  isOpen,
  allRoles,
  onClose,
  onConfirm,
}: {
  role: Role;
  isOpen: boolean;
  allRoles: Role[];
  onClose: () => void;
  onConfirm: (targetRoleId?: string) => void;
}) {
  const [targetRoleId, setTargetRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  const requiresReassignment = role._count.users > 0;

  const handleConfirm = async () => {
    if (requiresReassignment && !targetRoleId) {
      toast.error("Please select a role to reassign users to");
      return;
    }

    setLoading(true);
    await onConfirm(targetRoleId || undefined);
    setLoading(false);
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Role"
      variant="danger"
      confirmText="Delete Role"
      message={
        <div className="space-y-4">
          <p className="text-white">
            Are you sure you want to delete the role{" "}
            <strong className="text-red-400">{role.name}</strong>?
          </p>

          <div className="bg-gray-800/50 border-2 border-gray-700 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slug:</span>
              <code className="text-cyan-400">{role.slug}</code>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Assigned Users:</span>
              <span className="text-white font-bold">{role._count.users}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Permissions:</span>
              <span className="text-white">{role.permissions.length}</span>
            </div>
          </div>

          {requiresReassignment && (
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm">
                ⚠️ This role has {role._count.users} assigned user(s). You must select a target
                role to reassign them.
              </p>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reassign users to: *
              </label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-pixel-primary transition-colors duration-100"
                required={requiresReassignment}
              >
                <option value="">Select a role...</option>
                {allRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r._count.users} users)
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-red-400 text-sm">This action cannot be undone.</p>
        </div>
      }
    />
  );
}
