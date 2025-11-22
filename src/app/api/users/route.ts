import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET /api/users - List users with server-side pagination, search, sort, filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";

    // Build where clause
    const where: any = {};

    // Search filter (name or email)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Role filter (by roleId)
    if (roleFilter) {
      where.roleId = roleFilter;
    }

    // Status filter
    if (statusFilter && (statusFilter === "ACTIVE" || statusFilter === "INACTIVE")) {
      where.status = statusFilter;
    }

    // Count total
    const total = await prisma.user.count({ where });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
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
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, roleId, userId } = body;

    // Validation
    if (!email || !password || !name || !roleId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length < 3) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Validate roleId
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 }
      );
    }

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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId,
        status: "ACTIVE",
      },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "created",
          resource: "user",
          resourceId: user.id,
          details: {
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
          },
        },
      });
    }

    // Create notification for new user
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'INFO',
        title: 'New User Registered',
        message: `${user.name} (${user.email}) has joined the platform`,
        actionUrl: '/admin/users',
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
