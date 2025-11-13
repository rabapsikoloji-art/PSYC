
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        serviceType: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and coordinator can create services
    if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, duration, price, serviceType } = body;

    // Validation
    if (!name || !duration || !price || !serviceType) {
      return NextResponse.json({ error: "Tüm gerekli alanları doldurun" }, { status: 400 });
    }

    if (duration <= 0 || price <= 0) {
      return NextResponse.json({ error: "Süre ve fiyat pozitif olmalıdır" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        duration: parseInt(duration),
        price: parseFloat(price),
        serviceType,
        isActive: true
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
