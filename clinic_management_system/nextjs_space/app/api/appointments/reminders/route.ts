

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { 
  generateWhatsAppLink, 
  createAppointmentReminderMessage,
  createDailyAppointmentsMessage
} from "@/lib/meet-utils";

export const dynamic = "force-dynamic";

/**
 * 24 saat sonrasına kadar olan randevular için hatırlatma mesajları döndürür
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    
    // Sadece admin ve koordinatör erişebilir
    if (!["ADMINISTRATOR", "COORDINATOR"].includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // 24 saat sonrasına kadar olan randevuları getir
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyThreeHoursLater = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: twentyThreeHoursLater,
          lte: twentyFourHoursLater
        },
        status: "SCHEDULED"
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        personnel: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // WhatsApp linkleri oluştur
    const reminders = upcomingAppointments
      .filter(apt => apt.client.phone) // Sadece telefon numarası olanlar
      .map(apt => {
        const clientName = `${apt.client.firstName} ${apt.client.lastName}`;
        const personnelName = `${apt.personnel.firstName} ${apt.personnel.lastName}`;
        
        const message = createAppointmentReminderMessage(
          clientName,
          apt.appointmentDate,
          personnelName,
          apt.isOnline,
          apt.meetLink || undefined
        );
        
        const whatsappLink = generateWhatsAppLink(apt.client.phone!, message);
        
        return {
          appointmentId: apt.id,
          clientName,
          personnelName,
          appointmentDate: apt.appointmentDate,
          isOnline: apt.isOnline,
          phone: apt.client.phone,
          whatsappLink
        };
      });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Get appointment reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
