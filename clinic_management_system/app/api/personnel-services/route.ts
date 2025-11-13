
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Psikologun verdiği hizmetleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');

    if (!personnelId) {
      return NextResponse.json({ error: 'Personnel ID is required' }, { status: 400 });
    }

    const personnelServices = await prisma.personnelService.findMany({
      where: { personnelId },
      include: {
        service: true,
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

    return NextResponse.json(personnelServices);
  } catch (error) {
    console.error('Error fetching personnel services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Psikologa hizmet ata
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    // Sadece admin atayabilir
    if (user?.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { personnelId, serviceId } = data;

    if (!personnelId || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const personnelService = await prisma.personnelService.create({
      data: {
        personnelId,
        serviceId,
      },
      include: {
        service: true,
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

    return NextResponse.json(personnelService);
  } catch (error: any) {
    // Unique constraint hatası
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'This service is already assigned to this personnel' }, { status: 409 });
    }
    console.error('Error creating personnel service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Psikologdan hizmet kaldır
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (user?.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.personnelService.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Service removed from personnel' });
  } catch (error) {
    console.error('Error deleting personnel service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
