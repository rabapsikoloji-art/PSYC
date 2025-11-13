
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "Randevu ID gerekli" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          include: {
            user: true
          }
        },
        personnel: {
          include: {
            user: true
          }
        },
        service: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
    }

    // Send reminder to psychologist
    const personnelPhone = appointment.personnel.phone;
    const clientName = `${appointment.client.firstName} ${appointment.client.lastName}`;
    const appointmentDate = format(new Date(appointment.appointmentDate), "d MMMM yyyy HH:mm", { locale: tr });
    const serviceName = appointment.service.name;
    
    let message = `🔔 Seans Hatırlatması\n\n`;
    message += `Danışan: ${clientName}\n`;
    message += `Hizmet: ${serviceName}\n`;
    message += `Tarih & Saat: ${appointmentDate}\n`;
    
    if (appointment.isOnline && appointment.meetLink) {
      message += `\n📹 Online Görüşme\n`;
      message += `Google Meet: ${appointment.meetLink}\n`;
    } else {
      message += `\n📍 Yüz Yüze Görüşme\n`;
    }

    if (appointment.notes) {
      message += `\nNot: ${appointment.notes}\n`;
    }

    // Get WhatsApp integration settings
    const whatsappSettings = await prisma.integrationSettings.findUnique({
      where: { integrationType: "whatsapp" }
    });

    if (!whatsappSettings || !whatsappSettings.isActive) {
      // Create notification instead
      await prisma.notification.create({
        data: {
          userId: appointment.personnel.userId,
          title: "Seans Hatırlatması",
          message,
          type: "appointment",
          relatedId: appointment.id
        }
      });

      return NextResponse.json({ 
        success: true,
        message: "WhatsApp entegrasyonu aktif değil. Bildirim oluşturuldu."
      });
    }

    // TODO: Implement actual WhatsApp sending via Twilio
    // For now, just create a notification
    await prisma.notification.create({
      data: {
        userId: appointment.personnel.userId,
        title: "Seans Hatırlatması",
        message,
        type: "appointment",
        relatedId: appointment.id
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Hatırlatma gönderildi"
    });
  } catch (error) {
    console.error("Send session reminder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
