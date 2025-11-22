import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, password, name, roleId, status, userId } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) {
      if (name.length < 3) {
        return NextResponse.json(
          { success: false, error: "Name must be at least 3 characters" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check email uniqueness if changed
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        if (emailExists) {
          return NextResponse.json(
            { success: false, error: "Email already exists" },
            { status: 400 }
          );
        }
      }
      updateData.email = email;
    }

    if (roleId !== undefined) {
      // Check if role exists
      const roleExists = await prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!roleExists) {
        return NextResponse.json(
          { success: false, error: "Invalid role" },
          { status: 400 }
        );
      }
      updateData.roleId = roleId;
    }

    if (status !== undefined) {
      if (status !== "ACTIVE" && status !== "INACTIVE") {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (password !== undefined) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
            isSystem: true,
          },
        },
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            apiKeys: true,
            activityLogs: true,
            media: true,
          },
        },
      },
    });

    // Log activity
    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "updated",
          resource: "user",
          resourceId: user.id,
          details: {
            userName: user.name,
            userEmail: user.email,
            updatedFields: Object.keys(updateData),
          },
        },
      });
    }

    // Create notification for user update
    const changeDesc = [];
    if (updateData.name) changeDesc.push('name');
    if (updateData.email) changeDesc.push('email');
    if (updateData.roleId) changeDesc.push('role');
    if (updateData.status) changeDesc.push('status');
    
    if (changeDesc.length > 0) {
      await prisma.notification.create({
        data: {
          userId: null, // Broadcast to all admins
          type: 'INFO',
          title: 'User Updated',
          message: `${user.name}'s ${changeDesc.join(', ')} has been updated`,
          actionUrl: '/admin/users',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting own account
    if (userId && id === userId) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user with role to check if super admin
    const userWithRole = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    // Prevent deleting last SUPER_ADMIN
    if (userWithRole?.role.slug === "super_admin") {
      const superAdminRole = await prisma.role.findUnique({
        where: { slug: "super_admin" },
      });
      
      if (superAdminRole) {
        const superAdminCount = await prisma.user.count({
          where: { roleId: superAdminRole.id },
        });
        
        if (superAdminCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              error: "Cannot delete the last SUPER_ADMIN user",
            },
            { status: 400 }
          );
        }
      }
    }

    // Log activity before deletion
    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "deleted",
          resource: "user",
          resourceId: existingUser.id,
          details: {
            userName: existingUser.name,
            userEmail: existingUser.email,
            userRoleId: existingUser.roleId,
          },
        },
      });
    }

    // Create notification for user deletion
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'WARNING',
        title: 'User Deleted',
        message: `User ${existingUser.name} (${existingUser.email}) has been deleted`,
        actionUrl: '/admin/users',
      },
    });

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
