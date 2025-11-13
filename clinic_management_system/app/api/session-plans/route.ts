
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Seans planlarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const personnelId = searchParams.get('personnelId');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { personnel: true, client: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const where: any = {};
    
    // Rol bazlı filtreleme
    if (user.role === 'CLIENT') {
      where.clientId = user.client?.id;
    } else if (user.role === 'PSYCHOLOGIST') {
      if (personnelId) {
        where.personnelId = personnelId;
      } else {
        where.personnelId = user.personnel?.id;
      }
    }

    if (clientId && ['ADMINISTRATOR', 'COORDINATOR', 'PSYCHOLOGIST'].includes(user.role)) {
      where.clientId = clientId;
    }

    const sessionPlans = await prisma.sessionPlan.findMany({
      where,
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        personnel: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sessionPlans);
  } catch (error) {
    console.error('Error fetching session plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni seans planı oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { personnel: true },
    });

    // Sadece psikolog plan oluşturabilir
    if (!user?.personnel) {
      return NextResponse.json({ error: 'Only psychologists can create session plans' }, { status: 403 });
    }

    const data = await request.json();
    const { clientId, totalSessions, sessionType, frequency, startDate, endDate, notes } = data;

    if (!clientId || !totalSessions || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionPlan = await prisma.sessionPlan.create({
      data: {
        clientId,
        personnelId: user.personnel.id,
        totalSessions,
        sessionType,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes,
        status: 'ACTIVE',
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        personnel: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(sessionPlan);
  } catch (error) {
    console.error('Error creating session plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Seans planını güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { personnel: true },
    });

    if (!user?.personnel) {
      return NextResponse.json({ error: 'Only psychologists can update session plans' }, { status: 403 });
    }

    const data = await request.json();
    const { id, completedSessions, status, notes, endDate } = data;

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Sadece planı oluşturan psikolog güncelleyebilir
    const existingPlan = await prisma.sessionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.personnelId !== user.personnel.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionPlan = await prisma.sessionPlan.update({
      where: { id },
      data: {
        completedSessions,
        status,
        notes,
        endDate: endDate ? new Date(endDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        personnel: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(sessionPlan);
  } catch (error) {
    console.error('Error updating session plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
