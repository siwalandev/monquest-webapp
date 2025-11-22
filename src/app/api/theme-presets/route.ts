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

// Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// GET - List all theme presets
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    const presets = await prisma.themePreset.findMany({
      orderBy: [
        { isSystem: 'desc' }, // System presets first
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: presets,
    });
  } catch (error) {
    console.error('Get theme presets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme presets' },
      { status: 500 }
    );
  }
}

// POST - Create new theme preset
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    const { name, colors } = await request.json();

    if (!name || !colors) {
      return NextResponse.json(
        { error: 'Missing required fields: name, colors' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be 50 characters or less' },
        { status: 400 }
      );
    }

    if (!validateColors(colors)) {
      return NextResponse.json(
        { error: 'Invalid colors format. Required: primary, secondary, accent, dark, darker, light (all hex #RRGGBB)' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const existing = await prisma.themePreset.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A preset with this name already exists' },
        { status: 409 }
      );
    }

    const preset = await prisma.themePreset.create({
      data: {
        name,
        slug,
        colors,
        isSystem: false,
        isDefault: false,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'created',
        resource: 'theme_preset',
        resourceId: preset.id,
        details: { name, slug },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: preset,
    });
  } catch (error: any) {
    console.error('Create theme preset error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create theme preset' },
      { status: 500 }
    );
  }
}
