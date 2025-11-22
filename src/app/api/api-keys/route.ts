import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// GET - List all API keys
export async function GET(request: NextRequest) {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const { name, environment, userId } = await request.json();

    // Validate input
    if (!name || !environment || !userId) {
      return NextResponse.json(
        { error: 'Name, environment, and userId are required' },
        { status: 400 }
      );
    }

    // Generate unique API key
    const prefix = environment === 'PRODUCTION' ? 'mk_prod' : 
                   environment === 'DEVELOPMENT' ? 'mk_dev' : 'mk_stg';
    const key = `${prefix}_${nanoid(24)}`;

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        environment,
        status: 'ACTIVE',
        userId,
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
    await prisma.activityLog.create({
      data: {
        action: 'created',
        resource: 'api_key',
        resourceId: apiKey.id,
        details: { name: apiKey.name, environment: apiKey.environment },
        userId,
      },
    });

    // Create notification for new API key
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all admins
        type: 'SUCCESS',
        title: 'API Key Created',
        message: `New ${apiKey.environment} API key "${apiKey.name}" has been created`,
        actionUrl: '/admin/settings/api-keys',
      },
    });

    return NextResponse.json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
