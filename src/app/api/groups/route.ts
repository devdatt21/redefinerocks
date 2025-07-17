import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateGroupData } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateGroupData = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
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
    const { id, name, description } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: 'Group ID and name are required' }, { status: 400 });
    }

    // Check if user owns the group
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!existingGroup || existingGroup.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 });
    }

    const group = await prisma.group.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
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
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if user owns the group
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!existingGroup || existingGroup.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 });
    }

    await prisma.group.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
