
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Anamnez formlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    const anamnesisForm = await prisma.anamnesisForm.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(anamnesisForm);
  } catch (error) {
    console.error("Get anamnesis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Yeni anamnez formu oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sadece psikolog oluşturabilir
    if (session.user.role !== "PSYCHOLOGIST" && session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, ...data } = body;

    // Get personnel ID from session
    const personnel = await prisma.personnel.findUnique({
      where: { userId: session.user.id }
    });

    const anamnesisForm = await prisma.anamnesisForm.create({
      data: {
        ...data,
        clientId,
        personnelId: personnel?.id || null
      }
    });

    return NextResponse.json(anamnesisForm);
  } catch (error) {
    console.error("Create anamnesis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Anamnez formunu güncelle
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Anamnesis ID required" }, { status: 400 });
    }

    const anamnesisForm = await prisma.anamnesisForm.update({
      where: { id },
      data
    });

    return NextResponse.json(anamnesisForm);
  } catch (error) {
    console.error("Update anamnesis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
