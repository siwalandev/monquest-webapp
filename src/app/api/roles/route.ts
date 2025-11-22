import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/roles - List all roles with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const includeSystem = searchParams.get("includeSystem") !== "false";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (!includeSystem) {
      where.isSystem = false;
    }

    // Get total count
    const total = await prisma.role.count({ where });

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get roles with user count
    const roles = await prisma.role.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // Return in ServerDataTable format
    return NextResponse.json({
      success: true,
      data: {
        users: roles, // Keep 'users' key for compatibility with ServerDataTable
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      // Also keep old format for backward compatibility
      roles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, permissions } = body;

    // Validation
    if (!name || name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 3 and 50 characters" },
        { status: 400 }
      );
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase alphanumeric with hyphens only" },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Permissions must be an array" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingRole = await prisma.role.findUnique({
      where: { slug },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Role with this slug already exists" },
        { status: 409 }
      );
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        slug,
        description: description || null,
        permissions,
        isSystem: false,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // TODO: Log activity when auth is implemented
    // await prisma.activityLog.create({
    //   data: {
    //     action: "created",
    //     resource: "role",
    //     resourceId: role.id,
    //     details: { name: role.name, slug: role.slug },
    //     userId: currentUser.id,
    //   },
    // });

    // Create notification for new role
    const permissionsCount = Array.isArray(role.permissions) ? role.permissions.length : 0;
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'SUCCESS',
        title: 'New Role Created',
        message: `Role "${role.name}" has been created with ${permissionsCount} permissions`,
        actionUrl: '/admin/roles',
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
