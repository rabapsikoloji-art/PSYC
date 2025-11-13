
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function sendWhatsAppMessage(phoneNumber: string, message: string, apiKey: string) {
  // Burada gerçek WhatsApp API entegrasyonu yapılacak
  // Örnek: Twilio, Wati.io, Netgsm, vs.
  
  console.log('WhatsApp mesajı gönderiliyor:', {
    to: phoneNumber,
    message: message.substring(0, 50) + '...'
  });
  
  // Simüle edilmiş başarılı yanıt
  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMINISTRATOR', 'COORDINATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const settings = await getSettings();
    
    if (!settings?.whatsappApiEnabled || !settings?.whatsappApiKey) {
      return NextResponse.json({ error: "WhatsApp API etkin değil" }, { status: 400 });
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: "Randevu ID gerekli" }, { status: 400 });
    }

    // Randevuyu getir
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          include: {
            user: true
          }
        },
        personnel: true,
        service: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
    }

    const clientPhone = appointment.client.phone || appointment.client.user.phone;
    
    if (!clientPhone) {
      return NextResponse.json({ error: "Danışan telefon numarası bulunamadı" }, { status: 400 });
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `
Merhaba ${appointment.client.firstName},

${formattedDate} tarihinde saat ${formattedTime}'de ${appointment.personnel.firstName} ${appointment.personnel.lastName} ile ${appointment.isOnline ? 'online' : 'yüz yüze'} randevunuz bulunmaktadır.

${appointment.isOnline && appointment.meetLink ? `
Online görüşme linkiniz:
${appointment.meetLink}
` : ''}

Randevunuzu unutmayınız.

İyi günler dileriz.
${settings.clinicName || 'Klinik'}
    `.trim();

    await sendWhatsAppMessage(clientPhone, message, settings.whatsappApiKey);

    return NextResponse.json({ 
      success: true,
      message: "Hatırlatma gönderildi"
    });

  } catch (error) {
    console.error("WhatsApp reminder error:", error);
    return NextResponse.json({ error: "Hatırlatma gönderilemedi" }, { status: 500 });
  }
}
