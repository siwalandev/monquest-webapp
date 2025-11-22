import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all settings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !hasPermission(user.role.permissions as any, 'settings.view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const settings = await prisma.settings.findMany({
      where: category ? { category } : undefined,
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Create new setting
export async function POST(request: NextRequest) {
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

    const { key, value, category, description } = await request.json();

    if (!key || !value || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value, category' },
        { status: 400 }
      );
    }

    const setting = await prisma.settings.create({
      data: {
        key,
        value,
        category,
        description,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'created',
        resource: 'settings',
        resourceId: setting.id,
        details: { key, category },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error: any) {
    console.error('Create setting error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Setting key already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}
