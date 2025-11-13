
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Danışana psikolog ata
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, psychologistId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    // Psikolog veya admin atama yapabilir
    // Danışan da kendi psikologunu seçebilir
    const canAssign = 
      session.user.role === "ADMINISTRATOR" ||
      session.user.role === "COORDINATOR" ||
      session.user.role === "PSYCHOLOGIST" ||
      (session.user.role === "CLIENT" && session.user.client?.id === clientId);

    if (!canAssign) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Psikolog ID'nin geçerli olduğunu kontrol et
    if (psychologistId) {
      const psychologist = await prisma.personnel.findUnique({
        where: { id: psychologistId }
      });

      if (!psychologist) {
        return NextResponse.json({ error: "Psychologist not found" }, { status: 404 });
      }
    }

    // Client'ı güncelle
    const client = await prisma.client.update({
      where: { id: clientId },
      data: { assignedPsychologistId: psychologistId || null },
      include: {
        assignedPsychologist: {
          include: {
            services: {
              include: {
                service: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Assign psychologist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
