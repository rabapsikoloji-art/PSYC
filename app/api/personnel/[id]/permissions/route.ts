
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMINISTRATOR and COORDINATOR can change permissions
    if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const {
      canViewPayments,
      canCreateSessions,
      canEditSessions,
      canDeleteSessions,
      canViewAllClients
    } = body;

    const personnel = await prisma.personnel.update({
      where: { id: params.id },
      data: {
        canViewPayments,
        canCreateSessions,
        canEditSessions,
        canDeleteSessions,
        canViewAllClients
      }
    });

    return NextResponse.json(personnel);
  } catch (error) {
    console.error("Update permissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
