import { NextRequest, NextResponse } from "next/server";

// Permission constants (same as seed.ts)
const PERMISSIONS = {
  users: [
    { key: "users.view", label: "View Users", description: "Can view user list and details" },
    { key: "users.create", label: "Create Users", description: "Can create new users" },
    { key: "users.edit", label: "Edit Users", description: "Can edit existing users" },
    { key: "users.delete", label: "Delete Users", description: "Can delete users" },
    { key: "users.manage_roles", label: "Manage User Roles", description: "Can assign roles to users" },
  ],
  roles: [
    { key: "roles.view", label: "View Roles", description: "Can view role list and details" },
    { key: "roles.create", label: "Create Roles", description: "Can create new roles" },
    { key: "roles.edit", label: "Edit Roles", description: "Can edit existing roles" },
    { key: "roles.delete", label: "Delete Roles", description: "Can delete custom roles" },
    { key: "roles.assign", label: "Assign Roles", description: "Can assign roles to users" },
  ],
  content: [
    { key: "content.view", label: "View Content", description: "Can view all content" },
    { key: "content.create", label: "Create Content", description: "Can create new content" },
    { key: "content.edit", label: "Edit Content", description: "Can edit existing content" },
    { key: "content.delete", label: "Delete Content", description: "Can delete content" },
  ],
  media: [
    { key: "media.view", label: "View Media", description: "Can view media library" },
    { key: "media.upload", label: "Upload Media", description: "Can upload new media files" },
    { key: "media.delete", label: "Delete Media", description: "Can delete media files" },
  ],
  apiKeys: [
    { key: "apiKeys.view", label: "View API Keys", description: "Can view API keys" },
    { key: "apiKeys.create", label: "Create API Keys", description: "Can create new API keys" },
    { key: "apiKeys.delete", label: "Delete API Keys", description: "Can delete API keys" },
  ],
  settings: [
    { key: "settings.view", label: "View Settings", description: "Can view system settings" },
    { key: "settings.edit", label: "Edit Settings", description: "Can edit system settings" },
  ],
};

// GET /api/roles/permissions - List all available permissions grouped by category
export async function GET() {
  try {
    const groupedPermissions = Object.entries(PERMISSIONS).map(([category, permissions]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      permissions,
    }));

    return NextResponse.json(groupedPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
