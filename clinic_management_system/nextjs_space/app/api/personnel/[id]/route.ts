
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// DELETE - Delete personnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = params;

    // Check if personnel has appointments
    const appointmentCount = await prisma.appointment.count({
      where: { personnelId: id }
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        { error: "Bu personelin randevuları bulunmaktadır. Önce randevuları silmeniz gerekir." },
        { status: 400 }
      );
    }

    // Delete personnel (cascade will delete user)
    await prisma.personnel.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting personnel:", error);
    return NextResponse.json({ error: "Personel silinemedi" }, { status: 500 });
  }
}

// PUT - Update personnel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    const updatedPersonnel = await prisma.personnel.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        specialization: data.specialization,
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(updatedPersonnel);

  } catch (error) {
    console.error("Error updating personnel:", error);
    return NextResponse.json({ error: "Personel güncellenemedi" }, { status: 500 });
  }
}
