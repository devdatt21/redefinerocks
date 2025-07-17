import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, refId } = await request.json();

    if (!type || !refId) {
      return NextResponse.json({ error: 'Type and refId are required' }, { status: 400 });
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        refId_userId: {
          refId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like - create new like
      await prisma.like.create({
        data: {
          type,
          refId,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
