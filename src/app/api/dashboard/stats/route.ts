import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Get counts
    const [
      totalUsers,
      totalApiKeys,
      totalContent,
      totalMedia,
      activeApiKeys,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.apiKey.count(),
      prisma.content.count(),
      prisma.media.count(),
      prisma.apiKey.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalApiKeys,
          totalContent,
          totalMedia,
          activeApiKeys,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
