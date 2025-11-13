
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// GET - List all integrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Only admins can view integrations
    if (session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const integrations = await prisma.integrationSettings.findMany({
      orderBy: { integrationType: "asc" },
    });

    return NextResponse.json({ integrations });
  } catch (error: any) {
    console.error("Integrations GET error:", error);
    return NextResponse.json(
      { error: error.message || "Entegrasyonlar yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Create or update integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Only admins can manage integrations
    if (session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const body = await request.json();
    const { integrationType, providerName, config, isActive } = body;

    if (!integrationType || !config) {
      return NextResponse.json(
        { error: "Integration type ve config gereklidir" },
        { status: 400 }
      );
    }

    // Check if integration already exists
    const existing = await prisma.integrationSettings.findUnique({
      where: { integrationType },
    });

    let integration;
    if (existing) {
      // Update existing
      integration = await prisma.integrationSettings.update({
        where: { integrationType },
        data: {
          providerName,
          config,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    } else {
      // Create new
      integration = await prisma.integrationSettings.create({
        data: {
          integrationType,
          providerName,
          config,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    return NextResponse.json({ integration }, { status: existing ? 200 : 201 });
  } catch (error: any) {
    console.error("Integration POST error:", error);
    return NextResponse.json(
      { error: error.message || "Entegrasyon kaydedilemedi" },
      { status: 500 }
    );
  }
}
