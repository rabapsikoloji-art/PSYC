
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { generateMeetLink } from "@/lib/meet-utils";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    
    // Check permissions
    if (!["ADMINISTRATOR", "COORDINATOR", "PSYCHOLOGIST"].includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const data = await req.json();
    const { id } = params;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { transaction: true }
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
    }

    // Online durumu değiştiyse ve online yapıldıysa meet link oluştur
    const updateData: any = {};
    
    // Only include fields that are provided
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.personnelId !== undefined) updateData.personnelId = data.personnelId;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    if (data.appointmentDate !== undefined) updateData.appointmentDate = new Date(data.appointmentDate);
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isOnline !== undefined) updateData.isOnline = data.isOnline;
    
    updateData.updatedAt = new Date();

    // Remove isPaid from updateData as it's not an Appointment field
    const isPaid = data.isPaid;

    // isOnline true yapılıyorsa ve meetLink yoksa, yeni bir link oluştur
    if (data.isOnline && !existingAppointment.meetLink) {
      updateData.meetLink = generateMeetLink();
    }
    
    // isOnline false yapılıyorsa meetLink'i temizle
    if (data.isOnline === false) {
      updateData.meetLink = null;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          include: {
            user: true
          }
        },
        personnel: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        service: {
          select: {
            name: true
          }
        },
        transaction: true
      }
    });

    // Handle payment status
    if (isPaid !== undefined) {
      if (isPaid && !existingAppointment.transaction) {
        // Create transaction (payment received)
        await prisma.transaction.create({
          data: {
            appointmentId: id,
            clientId: appointment.clientId,
            amount: appointment.price || 0,
            type: 'INCOME',
            paymentMethod: 'CASH',
            description: `Randevu ödemesi - ${appointment.service.name}`,
            transactionDate: new Date()
          }
        });
      } else if (!isPaid && existingAppointment.transaction) {
        // Delete transaction (payment not received)
        await prisma.transaction.delete({
          where: { appointmentId: id }
        });
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    
    // Check permissions
    if (!["ADMINISTRATOR", "COORDINATOR"].includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = params;

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
