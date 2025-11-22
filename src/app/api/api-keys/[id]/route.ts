import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get single API key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error('Get API key error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    );
  }
}

// PUT - Update API key
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, status, userId } = await request.json();

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    if (userId) {
      await prisma.activityLog.create({
        data: {
          action: 'updated',
          resource: 'api_key',
          resourceId: apiKey.id,
          details: { name: apiKey.name, status: apiKey.status },
          userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error('Update API key error:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const apiKey = await prisma.apiKey.delete({
      where: { id },
    });

    // Log activity
    if (userId) {
      await prisma.activityLog.create({
        data: {
          action: 'deleted',
          resource: 'api_key',
          resourceId: apiKey.id,
          details: { name: apiKey.name },
          userId,
        },
      });
    }

    // Create notification for API key deletion
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'WARNING',
        title: 'API Key Deleted',
        message: `API key "${apiKey.name}" has been deleted`,
        actionUrl: '/admin/settings/api-keys',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
