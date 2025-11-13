
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Get blocked times
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const personnelId = url.searchParams.get("personnelId");

    let where: any = {};
    if (personnelId) {
      where.personnelId = personnelId;
    }

    const blockedTimes = await prisma.blockedTime.findMany({
      where,
      include: {
        personnel: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(blockedTimes);
  } catch (error) {
    console.error("Get blocked times error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create blocked time
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMINISTRATOR and PSYCHOLOGIST can block times
    if (!["ADMINISTRATOR", "COORDINATOR", "PSYCHOLOGIST"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { personnelId, startTime, endTime, reason } = body;

    if (!personnelId || !startTime || !endTime) {
      return NextResponse.json({ error: "Tüm gerekli alanları doldurun" }, { status: 400 });
    }

    // Check if psychologist is blocking their own time
    if (session.user.role === "PSYCHOLOGIST") {
      const personnel = await prisma.personnel.findUnique({
        where: { userId: session.user.id }
      });

      if (!personnel || personnel.id !== personnelId) {
        return NextResponse.json({ error: "Sadece kendi saatlerinizi bloke edebilirsiniz" }, { status: 403 });
      }
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        personnelId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reason: reason || null
      }
    });

    return NextResponse.json(blockedTime);
  } catch (error) {
    console.error("Create blocked time error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
