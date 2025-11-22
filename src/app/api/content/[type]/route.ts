import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get content by type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const contentType = type.toUpperCase().replace(/-/g, '_');

    const content = await prisma.content.findUnique({
      where: { type: contentType as any },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// PUT - Update content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const contentType = type.toUpperCase().replace(/-/g, '_');
    const { data, userId } = await request.json();

    // Validate input
    if (!data) {
      return NextResponse.json(
        { error: 'Content data is required' },
        { status: 400 }
      );
    }

    // Update or create content
    const content = await prisma.content.upsert({
      where: { type: contentType as any },
      update: {
        data: data,
      },
      create: {
        type: contentType as any,
        data: data,
      },
    });

    // Log activity
    if (userId) {
      await prisma.activityLog.create({
        data: {
          action: 'updated',
          resource: 'content',
          resourceId: content.id,
          details: { type: content.type },
          userId,
        },
      });
    }

    // Create notification for content update
    const contentName = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'SUCCESS',
        title: 'Content Updated',
        message: `${contentName} section has been successfully updated`,
        actionUrl: `/admin/content/${type}`,
      },
    });

    const response = NextResponse.json({
      success: true,
      data: content,
    });
    response.headers.set('X-Notification-Created', 'true');
    return response;
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
