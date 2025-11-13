
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Belirli bir danışanın seans notlarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const appointmentId = searchParams.get('appointmentId');

    if (!clientId && !appointmentId) {
      return NextResponse.json({ error: 'Client ID or Appointment ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { personnel: true, client: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Query parametreleri
    const where: any = {};
    if (appointmentId) {
      where.appointmentId = appointmentId;
    } else if (clientId) {
      where.clientId = clientId;
    }

    // Yetki kontrolü
    const userRole = (user as any).role;
    if (userRole === 'CLIENT') {
      // Client sadece kendi notlarını görebilir
      where.clientId = user.client?.id;
    } else if (userRole === 'PSYCHOLOGIST') {
      // Psikolog sadece kendi tuttuğu notları görebilir
      where.personnelId = user.personnel?.id;
    }

    const sessionNotes = await prisma.sessionNote.findMany({
      where,
      include: {
        appointment: {
          include: {
            service: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sessionNotes);
  } catch (error) {
    console.error('Error fetching session notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni seans notu oluştur
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

    // Sadece psikolog not tutabilir
    if (!user?.personnel) {
      return NextResponse.json({ error: 'Only psychologists can create session notes' }, { status: 403 });
    }

    const data = await request.json();
    const { appointmentId, clientId, content, isConfidential, includeInAI } = data;

    if (!appointmentId || !clientId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionNote = await prisma.sessionNote.create({
      data: {
        appointmentId,
        clientId,
        personnelId: user.personnel.id,
        content,
        isConfidential: isConfidential ?? true,
        includeInAI: includeInAI ?? false,
      },
      include: {
        appointment: {
          include: {
            service: true,
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
      },
    });

    return NextResponse.json(sessionNote);
  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Seans notunu güncelle
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
      return NextResponse.json({ error: 'Only psychologists can update session notes' }, { status: 403 });
    }

    const data = await request.json();
    const { id, content, isConfidential, includeInAI } = data;

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // Sadece notu tutan psikolog güncelleyebilir
    const existingNote = await prisma.sessionNote.findUnique({
      where: { id },
    });

    if (!existingNote || existingNote.personnelId !== user.personnel.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionNote = await prisma.sessionNote.update({
      where: { id },
      data: {
        content,
        isConfidential,
        includeInAI,
        updatedAt: new Date(),
      },
      include: {
        appointment: {
          include: {
            service: true,
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
      },
    });

    return NextResponse.json(sessionNote);
  } catch (error) {
    console.error('Error updating session note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
