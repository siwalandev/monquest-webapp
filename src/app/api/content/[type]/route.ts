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
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { data, userId } = body;

    // Validate input
    if (!data) {
      return NextResponse.json(
        { error: 'Content data is required' },
        { status: 400 }
      );
    }

    // Update or create content
    let content;
    try {
      content = await prisma.content.upsert({
        where: { type: contentType as any },
        update: {
          data: data,
        },
        create: {
          type: contentType as any,
          data: data,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: String(dbError) },
        { status: 500 }
      );
    }

    // Log activity (optional - don't fail if this fails)
    if (userId) {
      try {
        await prisma.activityLog.create({
          data: {
            action: 'updated',
            resource: 'content',
            resourceId: content.id,
            details: { type: content.type },
            userId,
          },
        });
      } catch (logError) {
        console.error('Activity log error (non-fatal):', logError);
        // Continue even if logging fails
      }
    }

    // Create notification (optional - don't fail if this fails)
    try {
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
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError);
      // Continue even if notification fails
    }

    const response = NextResponse.json({
      success: true,
      data: content,
    });
    response.headers.set('X-Notification-Created', 'true');
    return response;
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update content', details: String(error) },
      { status: 500 }
    );
  }
}
