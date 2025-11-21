import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrivyClient } from '@privy-io/server-auth';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const privyAppSecret = process.env.PRIVY_APP_SECRET!;

const privyClient = new PrivyClient(privyAppId, privyAppSecret);

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature: accessToken } = await request.json();

    if (!walletAddress || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify Privy access token
    try {
      const verifiedClaims = await privyClient.verifyAuthToken(accessToken);
      
      // Check if the wallet address matches the token
      if (!verifiedClaims.userId) {
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Check if user exists with this wallet
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: {
        role: true,
      },
    });

    // If user doesn't exist, create new user with default USER role (not admin)
    if (!user) {
      // Get default USER role for regular website visitors
      let defaultRole = await prisma.role.findUnique({
        where: { slug: 'user' },
      });

      if (!defaultRole) {
        // Create user role if it doesn't exist
        defaultRole = await prisma.role.create({
          data: {
            name: 'User',
            slug: 'user',
            description: 'Regular user with no admin access',
            permissions: [],
            isSystem: false,
          },
        });
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          authMethod: 'WEB3',
          roleId: defaultRole.id,
          status: 'ACTIVE',
          lastLogin: new Date(),
        },
        include: {
          role: true,
        },
      });
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress,
        authMethod: user.authMethod,
        role: {
          id: user.role.id,
          name: user.role.name,
          slug: user.role.slug,
          permissions: user.role.permissions as string[],
          isSystem: user.role.isSystem,
        },
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
