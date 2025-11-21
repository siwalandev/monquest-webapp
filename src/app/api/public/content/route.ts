import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

// GET - Fetch all public content (Hero, Features, How It Works)
export async function GET(request: NextRequest) {
  try {
    // Fetch all content in parallel
    const [heroContent, featuresContent, howItWorksContent] = await Promise.all([
      prisma.content.findUnique({
        where: { type: 'HERO' },
      }),
      prisma.content.findUnique({
        where: { type: 'FEATURES' },
      }),
      prisma.content.findUnique({
        where: { type: 'HOW_IT_WORKS' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        hero: heroContent?.data || null,
        features: featuresContent?.data || null,
        howItWorks: howItWorksContent?.data || null,
      },
    });
  } catch (error) {
    console.error('Get public content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
