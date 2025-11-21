import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    // Get role IDs first
    const [adminRole, superAdminRole] = await Promise.all([
      prisma.role.findUnique({ where: { slug: "admin" } }),
      prisma.role.findUnique({ where: { slug: "super_admin" } }),
    ]);

    const [totalUsers, activeUsers, adminCount, superAdminCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        adminRole ? prisma.user.count({ where: { roleId: adminRole.id } }) : 0,
        superAdminRole ? prisma.user.count({ where: { roleId: superAdminRole.id } }) : 0,
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminCount,
        superAdminCount,
        inactiveUsers: totalUsers - activeUsers,
      },
    });
  } catch (error) {
    console.error("GET /api/users/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
