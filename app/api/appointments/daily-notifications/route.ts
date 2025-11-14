import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { 
  generateWhatsAppLink, 
  createDailyAppointmentsMessage
} from "@/lib/meet-utils";

export const dynamic = "force-dynamic";

/**
 * Günlük randevu bildirimlerini psikologlara gönderir
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

    // Bugünün başlangıcı ve bitişi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugünkü randevuları getir
    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow
        },
        status: "SCHEDULED"
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        personnel: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });

    // Psikologlara göre grupla
    const appointmentsByPersonnel = new Map<string, typeof todaysAppointments>();
    
    todaysAppointments.forEach((apt: any) => {
      const personnelId = apt.personnel.id;
      if (!appointmentsByPersonnel.has(personnelId)) {
        appointmentsByPersonnel.set(personnelId, []);
      }
      appointmentsByPersonnel.get(personnelId)!.push(apt);
    });

    // Her psikolog için WhatsApp linki oluştur
    const notifications = Array.from(appointmentsByPersonnel.entries())
      .filter(([_, apts]) => apts[0]?.personnel.phone) // Sadece telefon numarası olanlar
      .map(([personnelId, apts]) => {
        const personnel = apts[0].personnel;
        const personnelName = `${personnel.firstName} ${personnel.lastName}`;
        
        const appointmentList = apts.map(apt => ({
          clientName: `${apt.client.firstName} ${apt.client.lastName}`,
          time: new Intl.DateTimeFormat('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          }).format(apt.appointmentDate),
          isOnline: apt.isOnline
        }));
        
        const message = createDailyAppointmentsMessage(personnelName, appointmentList);
        const whatsappLink = generateWhatsAppLink(personnel.phone!, message);
        
        return {
          personnelId,
          personnelName,
          phone: personnel.phone,
          appointmentCount: apts.length,
          appointments: appointmentList,
          whatsappLink
        };
      });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get daily notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
