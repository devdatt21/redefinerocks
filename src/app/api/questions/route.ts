import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateQuestionData } from '@/types';
import { Prisma } from '@prisma/client';

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

    const whereClause: Prisma.QuestionWhereInput = {};
    
    if (groupId) {
      whereClause.groupId = groupId;
    }

    if (query) {
      whereClause.OR = [
        {
          text: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        {
          answers: {
            some: {
              OR: [
                {
                  text: {
                    contains: query,
                    mode: 'insensitive'
                  }
                },
                {
                  user: {
                    name: {
                      contains: query,
                      mode: 'insensitive'
                    }
                  }
                }
              ]
            }
          }
        }
      ];
    }

    // Add filter for unanswered questions
    if (sortBy === 'unanswered') {
      // Create a new where clause that includes the unanswered filter
      const unansweredFilter = {
        answers: {
          none: {}
        }
      };

      if (Object.keys(whereClause).length === 0) {
        // If no existing filters, just add the unanswered filter
        Object.assign(whereClause, unansweredFilter);
      } else {
        // If there are existing filters, combine them with AND
        const existingClause = { ...whereClause };
        // Clear existing properties
        (Object.keys(whereClause) as Array<keyof typeof whereClause>).forEach(key => delete whereClause[key]);
        whereClause.AND = [existingClause, unansweredFilter];
      }
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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, text } = body;

    if (!id || !text?.trim()) {
      return NextResponse.json({ error: 'Question ID and text are required' }, { status: 400 });
    }

    // Check if user owns the question
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!existingQuestion || existingQuestion.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Question not found or unauthorized' }, { status: 404 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        text: text.trim(),
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

    // Get likes count separately
    const likesCount = await prisma.like.count({
      where: {
        refId: question.id,
        type: 'QUESTION'
      }
    });

    const questionWithLikes = {
      ...question,
      _count: {
        ...question._count,
        likes: likesCount
      }
    };

    return NextResponse.json(questionWithLikes);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Check if user owns the question
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!existingQuestion || existingQuestion.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Question not found or unauthorized' }, { status: 404 });
    }

    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
