import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const refId = searchParams.get('refId');

    if (!type || !refId) {
      return NextResponse.json({ error: 'Type and refId are required' }, { status: 400 });
    }

    const like = await prisma.like.findUnique({
      where: {
        refId_userId: {
          refId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
