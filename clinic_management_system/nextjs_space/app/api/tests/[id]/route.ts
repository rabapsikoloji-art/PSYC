
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET single test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const test = await prisma.test.findUnique({
      where: { id: params.id },
      include: {
        client: {
          include: {
            user: {
              select: { name: true, accountType: true },
            },
          },
        },
        personnel: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test bulunamadı" }, { status: 404 });
    }

    // Authorization check
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      });
      if (!client || test.clientId !== client.id) {
        return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
      }
    }

    return NextResponse.json({ test });
  } catch (error: any) {
    console.error("Test GET error:", error);
    return NextResponse.json(
      { error: error.message || "Test yüklenemedi" },
      { status: 500 }
    );
  }
}

// DELETE test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Only psychologists and admins can delete tests
    if (!["PSYCHOLOGIST", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    await prisma.test.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Test DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Test silinemedi" },
      { status: 500 }
    );
  }
}
