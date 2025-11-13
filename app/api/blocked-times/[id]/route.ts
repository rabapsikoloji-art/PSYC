
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMINISTRATOR", "COORDINATOR", "PSYCHOLOGIST"].includes(session.user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const blockedTime = await prisma.blockedTime.findUnique({
      where: { id: params.id }
    });

    if (!blockedTime) {
      return NextResponse.json({ error: "Bloke edilmiş saat bulunamadı" }, { status: 404 });
    }

    // Check if psychologist is deleting their own blocked time
    if (session.user.role === "PSYCHOLOGIST") {
      const personnel = await prisma.personnel.findUnique({
        where: { userId: session.user.id }
      });

      if (!personnel || personnel.id !== blockedTime.personnelId) {
        return NextResponse.json({ error: "Sadece kendi bloklarınızı silebilirsiniz" }, { status: 403 });
      }
    }

    await prisma.blockedTime.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blocked time error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
