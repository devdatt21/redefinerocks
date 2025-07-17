import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateAnswerData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateAnswerData = await request.json();
    const { text, audioUrl, questionId } = body;

    if (!text?.trim() && !audioUrl) {
      return NextResponse.json({ error: 'Answer text or audio URL is required' }, { status: 400 });
    }

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const answer = await prisma.answer.create({
      data: {
        text: text?.trim(),
        audioUrl,
        questionId,
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Get likes count separately since it's not a direct relation
    const likesCount = await prisma.like.count({
      where: {
        refId: answer.id,
        type: 'ANSWER'
      }
    });

    // Add likes count to the response
    const answerWithLikes = {
      ...answer,
      _count: {
        likes: likesCount
      }
    };

    return NextResponse.json(answerWithLikes, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
