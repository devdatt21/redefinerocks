import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateQuestionData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const query = searchParams.get('query');
    const sortBy = searchParams.get('sortBy') || 'recent';

    const whereClause: {
      groupId?: string;
      text?: { contains: string; mode: 'insensitive' };
    } = {};
    
    if (groupId) {
      whereClause.groupId = groupId;
    }

    if (query) {
      whereClause.text = {
        contains: query,
        mode: 'insensitive'
      };
    }

    const orderBy: { createdAt: 'desc' } = { createdAt: 'desc' };
    
    // For popular sorting, we'll need to handle it differently since likes aren't directly related
    if (sortBy === 'popular') {
      // orderBy = { createdAt: 'desc' }; // Fallback to recent for now
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        },
        _count: {
          select: { answers: true }
        }
      },
      orderBy
    });

    // Get likes count for each question separately
    const questionsWithLikes = await Promise.all(
      questions.map(async (question) => {
        const likesCount = await prisma.like.count({
          where: {
            refId: question.id,
            type: 'QUESTION'
          }
        });

        return {
          ...question,
          _count: {
            ...question._count,
            likes: likesCount
          }
        };
      })
    );

    // If sorting by popular, sort by likes count
    if (sortBy === 'popular') {
      questionsWithLikes.sort((a, b) => b._count.likes - a._count.likes);
    }

    return NextResponse.json(questionsWithLikes);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateQuestionData = await request.json();
    const { text, groupId } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        groupId,
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, name: true }
        },
        _count: {
          select: { answers: true }
        }
      }
    });

    // Get likes count separately since it's not a direct relation
    const likesCount = await prisma.like.count({
      where: {
        refId: question.id,
        type: 'QUESTION'
      }
    });

    // Add likes count to the response
    const questionWithLikes = {
      ...question,
      _count: {
        ...question._count,
        likes: likesCount
      }
    };

    return NextResponse.json(questionWithLikes, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
