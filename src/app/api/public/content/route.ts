import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

// GET - Fetch public content (single type or all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type')?.toUpperCase();

    // If specific type requested, return only that
    if (type) {
      const content = await prisma.content.findUnique({
        where: { type },
      });

      return NextResponse.json({
        success: true,
        data: content,
      });
    }

    // Otherwise return all content
    const [heroContent, featuresContent, howItWorksContent, roadmapContent, faqContent] = await Promise.all([
      prisma.content.findUnique({
        where: { type: 'HERO' },
      }),
      prisma.content.findUnique({
        where: { type: 'FEATURES' },
      }),
      prisma.content.findUnique({
        where: { type: 'HOW_IT_WORKS' },
      }),
      prisma.content.findUnique({
        where: { type: 'ROADMAP' },
      }),
      prisma.content.findUnique({
        where: { type: 'FAQ' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        hero: heroContent?.data || null,
        features: featuresContent?.data || null,
        howItWorks: howItWorksContent?.data || null,
        roadmap: roadmapContent?.data || null,
        faq: faqContent?.data || null,
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
