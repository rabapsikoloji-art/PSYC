
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - List all notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: any = { userId: session.user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    try {
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      });

      return NextResponse.json({ notifications, unreadCount });
    } catch (tableError: any) {
      // If Notification table doesn't exist yet, return empty result
      if (tableError.code === 'P2021') {
        return NextResponse.json({ notifications: [], unreadCount: 0 });
      }
      throw tableError;
    }
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: error.message || "Bildirimler yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Create a new notification (admin/system only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Only admins can create notifications
    if (session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, message, type, relatedId } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "User ID, başlık ve mesaj gereklidir" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "general",
        relatedId,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error: any) {
    console.error("Notification POST error:", error);
    return NextResponse.json(
      { error: error.message || "Bildirim oluşturulamadı" },
      { status: 500 }
    );
  }
}
