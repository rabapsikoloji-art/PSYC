
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Uygulama ayarlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.appSettings.findFirst();

    // Eğer ayar yoksa default oluştur
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          calendarSlotDuration: 30,
          calendarMinTime: "00:00",
          calendarMaxTime: "24:00",
          defaultView: "timeGridWeek"
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Ayarları güncelle
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sadece admin güncelleyebilir
    if (session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();

    // İlk ayarı bul veya oluştur
    let settings = await prisma.appSettings.findFirst();

    if (settings) {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: body
      });
    } else {
      settings = await prisma.appSettings.create({
        data: body
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
