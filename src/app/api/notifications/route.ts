import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

// GET - Fetch notifications with pagination
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { userId: userId },
        { userId: null }, // Broadcast notifications
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search } },
            { message: { contains: search } },
          ],
        },
      ];
    }

    if (unreadOnly) {
      where.read = false;
    }

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create notification (admin only)
export async function POST(req: NextRequest) {
  try {
    const currentUserId = req.headers.get('x-user-id');
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { role: true },
    });

    if (!user || !hasPermission(user.role.permissions as any, 'content.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, type, title, message, actionUrl } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId || null,
        type: type || "INFO",
        title,
        message,
        actionUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all notifications for current user
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: userId },
          { userId: null },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error: any) {
    console.error("Clear notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
