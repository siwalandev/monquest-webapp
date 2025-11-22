import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// POST - Apply theme preset (set as active)
export async function POST(
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

    // Verify preset exists
    const preset = await prisma.themePreset.findUnique({
      where: { slug },
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Theme preset not found' },
        { status: 404 }
      );
    }

    // Update active_theme_preset setting
    await prisma.settings.upsert({
      where: { key: 'active_theme_preset' },
      update: { value: { slug } },
      create: {
        key: 'active_theme_preset',
        value: { slug },
        category: 'appearance',
        description: 'Currently active theme preset slug',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'updated',
        resource: 'settings',
        resourceId: 'active_theme_preset',
        details: { action: 'apply_preset', slug, presetName: preset.name },
        userId: user.id,
      },
    });

    // Revalidate all pages to apply new theme globally
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: `Theme preset "${preset.name}" applied successfully`,
      data: {
        preset,
        activePresetSlug: slug,
      },
    });
  } catch (error) {
    console.error('Apply theme preset error:', error);
    return NextResponse.json(
      { error: 'Failed to apply theme preset' },
      { status: 500 }
    );
  }
}
