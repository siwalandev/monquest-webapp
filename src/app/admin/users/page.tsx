"use client";

import { useState, useEffect } from "react";
import { ServerDataTable } from "@/components/ui/ServerDataTable";
import { ColumnDef } from "@tanstack/react-table";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import RoleBadge from "@/components/ui/RoleBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  IoAdd,
  IoCreate,
  IoTrash,
  IoKey,
  IoEye,
  IoEyeOff,
  IoPerson,
  IoCheckmarkCircle,
  IoShield,
  IoShieldCheckmark,
} from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";

interface Role {
  id: string;
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleId: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    apiKeys: number;
    activityLogs: number;
    media: number;
  };
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  superAdminCount: number;
}

export default function UsersPage() {
  const { user, isSuperAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  // User form modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  // Reset password modal
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  // Fetch stats and roles
  useEffect(() => {
    fetchStats();
    fetchRoles();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/users/stats");
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles?includeSystem=true");
      const result = await response.json();
      if (result.roles) {
        setRoles(result.roles);
        // Set default role if not set
        if (!userForm.roleId && result.roles.length > 0) {
          const adminRole = result.roles.find((r: Role) => r.slug === 'admin');
          if (adminRole) {
            setUserForm(prev => ({ ...prev, roleId: adminRole.id }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-white">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }) => {
        if (!row.original.lastLogin) {
          return <span className="text-gray-500">Never</span>;
        }
        const lastLogin = new Date(row.original.lastLogin);
        return (
          <span
            className="text-gray-400"
            title={format(lastLogin, "PPpp")}
          >
            {formatDistanceToNow(lastLogin, { addSuffix: true })}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const created = new Date(row.original.createdAt);
        return (
          <span className="text-gray-400" title={format(created, "PPpp")}>
            {format(created, "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const canEdit =
          isSuperAdmin() ||
          (user?.role?.slug !== "super_admin" && row.original.role.slug !== "super_admin");
        const canDelete =
          isSuperAdmin() &&
          user?.id !== row.original.id;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditUserModal(row.original)}
              disabled={!canEdit}
              className="p-2 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title={canEdit ? "Edit user" : "No permission"}
            >
              <IoCreate className="text-lg" />
            </button>
            <button
              onClick={() => openResetPasswordModal(row.original)}
              disabled={!canEdit}
              className="p-2 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title={canEdit ? "Reset password" : "No permission"}
            >
              <IoKey className="text-lg" />
            </button>
            <button
              onClick={() => setDeleteConfirm({ isOpen: true, user: row.original })}
              disabled={!canDelete}
              className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title={
                !canDelete
                  ? user?.id === row.original.id
                    ? "Cannot delete yourself"
                    : "No permission"
                  : "Delete user"
              }
            >
              <IoTrash className="text-lg" />
            </button>
          </div>
        );
      },
    },
  ];

  // CRUD operations
  const openAddUserModal = () => {
    setEditingUser(null);
    const defaultRole = roles.find(r => r.slug === 'admin');
    setUserForm({
      name: "",
      email: "",
      password: "",
      roleId: defaultRole?.id || (roles[0]?.id || ""),
      status: "ACTIVE",
    });
    setShowPassword(false);
    setUserModalOpen(true);
  };

  const openEditUserModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: "",
      roleId: userToEdit.roleId,
      status: userToEdit.status,
    });
    setShowPassword(false);
    setUserModalOpen(true);
  };

  const handleUserSubmit = async () => {
    // Validation
    if (!userForm.name || !userForm.email) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editingUser && !userForm.password) {
      toast.error("Password is required for new users");
      return;
    }

    try {
      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const body: any = {
        name: userForm.name,
        email: userForm.email,
        roleId: userForm.roleId,
        status: userForm.status,
        userId: user?.id,
      };

      if (userForm.password) {
        body.password = userForm.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          editingUser ? "User updated successfully!" : "User created successfully!"
        );
        setUserModalOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(result.error || "Failed to save user");
      }
    } catch (error) {
      console.error("Save user error:", error);
      toast.error("Failed to save user");
    }
  };

  const openResetPasswordModal = (userToReset: User) => {
    setResetUser(userToReset);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setResetPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `/api/users/${resetUser?.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: newPassword,
            userId: user?.id,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Password reset successfully!");
        setResetPasswordOpen(false);
      } else {
        toast.error(result.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to reset password");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm.user) return;

    try {
      const response = await fetch(
        `/api/users/${deleteConfirm.user.id}?userId=${user?.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("User deleted successfully!");
        setDeleteConfirm({ isOpen: false, user: null });
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl text-white font-bold mb-2">User Management</h1>
          <p className="text-sm text-gray-400">
            Manage admin users, roles, and permissions
          </p>
        </div>
        <button
          onClick={openAddUserModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100"
        >
          <IoAdd className="text-xl" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoPerson className="text-2xl text-gray-400" />
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          </div>

          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoCheckmarkCircle className="text-2xl text-green-400" />
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {stats.activeUsers}
            </div>
          </div>

          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoShield className="text-2xl text-blue-400" />
              <div className="text-sm text-gray-400">Admins</div>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.adminCount}
            </div>
          </div>

          <div className="bg-gray-900 border-2 border-gray-800 p-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <IoShieldCheckmark className="text-2xl text-green-400" />
              <div className="text-sm text-gray-400">Super Admins</div>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {stats.superAdminCount}
            </div>
          </div>
        </div>
      )}

      {/* DataTable */}
      <ServerDataTable
        columns={columns}
        fetchUrl="/api/users"
        searchPlaceholder="Search by name or email..."
        onRefresh={() => setRefreshKey((k) => k + 1)}
      />

      {/* User Form Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleUserSubmit}
              className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-100"
            >
              {editingUser ? "Update" : "Create"} User
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password {!editingUser && "*"}
              {editingUser && " (leave blank to keep current)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Role *
            </label>
            <select
              value={userForm.roleId}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  roleId: e.target.value,
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status *
              </label>
              <select
                value={userForm.status}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    status: e.target.value as "ACTIVE" | "INACTIVE",
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        title="Reset Password"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setResetPasswordOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-100"
            >
              Reset Password
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500 p-3 text-sm text-yellow-400">
            <strong>{resetUser?.name}</strong> will need to use this new password
            on their next login.
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">
              <strong>Email:</strong> {resetUser?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="Repeat password"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
        onConfirm={handleDeleteUser}
        title="Delete User?"
        message={
          <>
            <p className="mb-3">
              Are you sure you want to delete <strong>{deleteConfirm.user?.name}</strong>?
            </p>
            <p className="mb-3 text-sm text-gray-400">
              This will also delete:
            </p>
            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 mb-3">
              <li>{deleteConfirm.user?._count.apiKeys || 0} API keys</li>
              <li>{deleteConfirm.user?._count.activityLogs || 0} activity logs</li>
              <li>{deleteConfirm.user?._count.media || 0} media files</li>
            </ul>
            <p className="text-sm text-red-400 font-medium">
              This action cannot be undone.
            </p>
          </>
        }
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
}
