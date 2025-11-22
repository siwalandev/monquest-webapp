import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Hex color validation
const isValidHex = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

// Validate theme colors object
const validateColors = (colors: any): boolean => {
  const requiredKeys = ['primary', 'secondary', 'accent', 'dark', 'darker', 'light'];
  
  if (!colors || typeof colors !== 'object') return false;
  
  for (const key of requiredKeys) {
    if (!colors[key] || !isValidHex(colors[key])) {
      return false;
    }
  }
  
  return true;
};

// GET - Get specific theme preset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;

    const preset = await prisma.themePreset.findUnique({
      where: { slug },
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Theme preset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: preset,
    });
  } catch (error) {
    console.error('Get theme preset error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme preset' },
      { status: 500 }
    );
  }
}

// PUT - Update theme preset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;
    const { name, colors } = await request.json();

    // Check if preset exists and is not system
    const existing = await prisma.themePreset.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Theme preset not found' },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'Cannot edit system presets. Create a new preset instead.' },
        { status: 403 }
      );
    }

    // Validate colors if provided
    if (colors && !validateColors(colors)) {
      return NextResponse.json(
        { error: 'Invalid colors format. Required: primary, secondary, accent, dark, darker, light (all hex #RRGGBB)' },
        { status: 400 }
      );
    }

    // Validate name length if provided
    if (name && name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be 50 characters or less' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (colors) updateData.colors = colors;

    const preset = await prisma.themePreset.update({
      where: { slug },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'updated',
        resource: 'theme_preset',
        resourceId: preset.id,
        details: { slug, changes: updateData },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: preset,
    });
  } catch (error: any) {
    console.error('Update theme preset error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update theme preset' },
      { status: 500 }
    );
  }
}

// DELETE - Delete theme preset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;

    // Check if preset exists and is not system
    const existing = await prisma.themePreset.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Theme preset not found' },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system presets' },
        { status: 403 }
      );
    }

    // Check if it's currently active
    const activeSetting = await prisma.settings.findUnique({
      where: { key: 'active_theme_preset' },
    });

    if (activeSetting && activeSetting.value === slug) {
      return NextResponse.json(
        { error: 'Cannot delete the currently active preset. Switch to another preset first.' },
        { status: 400 }
      );
    }

    await prisma.themePreset.delete({
      where: { slug },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'deleted',
        resource: 'theme_preset',
        resourceId: existing.id,
        details: { slug, name: existing.name },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Theme preset deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete theme preset error:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete theme preset' },
      { status: 500 }
    );
  }
}
