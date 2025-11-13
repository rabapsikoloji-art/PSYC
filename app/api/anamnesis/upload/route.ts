
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sadece psikolog ve admin yükleyebilir
    if (session.user.role !== "PSYCHOLOGIST" && session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const anamnesisId = formData.get("anamnesisId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    // Dosya türü kontrolü
    if (!file.name.match(/\.(doc|docx)$/i)) {
      return NextResponse.json({ error: "Only Word files are allowed" }, { status: 400 });
    }

    // Dosyayı S3'e yükle
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `anamnesis/${clientId}/${Date.now()}-${file.name}`;
    const cloud_storage_path = await uploadFile(buffer, fileName);

    // Eğer var olan bir anamnez formu varsa güncelle, yoksa yeni oluştur
    let anamnesisForm;
    if (anamnesisId) {
      anamnesisForm = await prisma.anamnesisForm.update({
        where: { id: anamnesisId },
        data: { uploadedFile: cloud_storage_path }
      });
    } else {
      // Personnel ID'yi bul
      const personnel = await prisma.personnel.findUnique({
        where: { userId: session.user.id }
      });

      anamnesisForm = await prisma.anamnesisForm.create({
        data: {
          clientId,
          personnelId: personnel?.id || null,
          uploadedFile: cloud_storage_path
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      cloud_storage_path,
      anamnesisForm 
    });
  } catch (error) {
    console.error("Upload anamnesis file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
