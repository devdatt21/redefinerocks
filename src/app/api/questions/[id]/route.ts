import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        },
        answers: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { answers: true }
        }
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Get likes count for the question
    const questionLikesCount = await prisma.like.count({
      where: {
        refId: question.id,
        type: 'QUESTION'
      }
    });

    // Get likes count for each answer
    const answersWithLikes = await Promise.all(
      question.answers.map(async (answer) => {
        const answerLikesCount = await prisma.like.count({
          where: {
            refId: answer.id,
            type: 'ANSWER'
          }
        });

        return {
          ...answer,
          _count: {
            likes: answerLikesCount
          }
        };
      })
    );

    const questionWithLikes = {
      ...question,
      answers: answersWithLikes,
      _count: {
        ...question._count,
        likes: questionLikesCount
      }
    };

    return NextResponse.json(questionWithLikes);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
