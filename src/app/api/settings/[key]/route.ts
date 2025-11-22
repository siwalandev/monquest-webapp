import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';

// GET - Get specific setting by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    const { key } = await params;

    const setting = await prisma.settings.findUnique({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error('Get setting error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting' },
      { status: 500 }
    );
  }
}

// PUT - Update setting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !hasPermission(user.role.permissions as any, 'settings.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { key } = await params;
    const { value } = await request.json();

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: value' },
        { status: 400 }
      );
    }

    const setting = await prisma.settings.update({
      where: { key },
      data: { value },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'updated',
        resource: 'settings',
        resourceId: setting.id,
        details: { key, oldValue: setting.value, newValue: value },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error: any) {
    console.error('Update setting error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete setting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !hasPermission(user.role.permissions as any, 'settings.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { key } = await params;

    await prisma.settings.delete({
      where: { key },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'deleted',
        resource: 'settings',
        resourceId: key,
        details: { key },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete setting error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
