import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/roles/[id] - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, permissions } = body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // For system roles, only allow updating permissions
    if (existingRole.isSystem) {
      if (!Array.isArray(permissions)) {
        return NextResponse.json(
          { error: "Permissions must be an array" },
          { status: 400 }
        );
      }

      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          permissions,
        },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      return NextResponse.json(updatedRole);
    }

    // For custom roles, allow updating name, description, and permissions
    const updateData: any = {};

    if (name !== undefined) {
      if (name.length < 3 || name.length > 50) {
        return NextResponse.json(
          { error: "Name must be between 3 and 50 characters" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return NextResponse.json(
          { error: "Permissions must be an array" },
          { status: 400 }
        );
      }
      updateData.permissions = permissions;
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // TODO: Log activity
    // await prisma.activityLog.create({
    //   data: {
    //     action: "updated",
    //     resource: "role",
    //     resourceId: id,
    //     details: updateData,
    //     userId: currentUser.id,
    //   },
    // });

    // Create notification for role update
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'INFO',
        title: 'Role Updated',
        message: `Role "${updatedRole.name}" has been updated`,
        actionUrl: '/admin/roles',
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Delete role with user reassignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetRoleId } = body;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return NextResponse.json(
        { error: "System roles cannot be deleted" },
        { status: 403 }
      );
    }

    // Check if role has users
    if (role._count.users > 0) {
      if (!targetRoleId) {
        return NextResponse.json(
          { 
            error: "Role has assigned users. Please provide targetRoleId to reassign them.",
            userCount: role._count.users,
          },
          { status: 400 }
        );
      }

      // Verify target role exists
      const targetRole = await prisma.role.findUnique({
        where: { id: targetRoleId },
      });

      if (!targetRole) {
        return NextResponse.json(
          { error: "Target role not found" },
          { status: 404 }
        );
      }

      // Reassign users to target role
      await prisma.user.updateMany({
        where: { roleId: id },
        data: { roleId: targetRoleId },
      });
    }

    // Delete role
    await prisma.role.delete({
      where: { id },
    });

    // TODO: Log activity
    // await prisma.activityLog.create({
    //   data: {
    //     action: "deleted",
    //     resource: "role",
    //     resourceId: id,
    //     details: { 
    //       name: role.name, 
    //       userCount: role._count.users,
    //       reassignedTo: targetRoleId ? targetRole?.name : null,
    //     },
    //     userId: currentUser.id,
    //   },
    // });

    // Create notification for role deletion
    const message = role._count.users > 0 
      ? `Role "${role.name}" has been deleted and ${role._count.users} users were reassigned`
      : `Role "${role.name}" has been deleted`;
    
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'WARNING',
        title: 'Role Deleted',
        message,
        actionUrl: '/admin/roles',
      },
    });

    return NextResponse.json({ 
      message: "Role deleted successfully",
      reassignedUsers: role._count.users,
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
