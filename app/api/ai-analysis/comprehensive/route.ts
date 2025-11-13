
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !["PSYCHOLOGIST", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, testIds, sessionNoteIds, includeAnamnesis } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    // Fetch client data
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: { select: { name: true } }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let analysisData = `Danışan: ${client.user.name}\n\n`;

    // Fetch selected tests
    if (testIds && testIds.length > 0) {
      const tests = await prisma.test.findMany({
        where: { id: { in: testIds } },
        orderBy: { createdAt: "desc" }
      });

      analysisData += "=== TEST SONUÇLARI ===\n\n";
        tests.forEach((test: any) => {  // ← any tipi ekleyin
        const testTypeMap: Record<string, string> = {
          BECK_DEPRESSION: "Beck Depresyon Envanteri",
          BECK_ANXIETY: "Beck Anksiyete Envanteri",
          SCL_90: "SCL-90-R Belirti Tarama Listesi",
          MMPI: "Minnesota Çok Yönlü Kişilik Envanteri",
          OTOMATIK_DUSUNCELER: "Otomatik Düşünceler Ölçeği"
        };
        
        analysisData += `${testTypeMap[test.testType] || test.testType}\n`;
        analysisData += `Tarih: ${new Date(test.completedAt || test.createdAt).toLocaleDateString("tr-TR")}\n`;
        analysisData += `Toplam Puan: ${test.totalScore}\n`;
        analysisData += `Şiddet: ${test.severity}\n`;
        if (test.aiAnalysis) {
          analysisData += `AI Değerlendirmesi: ${test.aiAnalysis}\n`;
        }
        analysisData += "\n";
      });
    }

    // Fetch selected session notes
    if (sessionNoteIds && sessionNoteIds.length > 0) {
      const notes = await prisma.sessionNote.findMany({
        where: { id: { in: sessionNoteIds } },
        include: {
          appointment: {
            select: { appointmentDate: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      analysisData += "=== SEANS NOTLARI ===\n\n";
      notes.forEach((note) => {
        const date = note.appointment?.appointmentDate || note.createdAt;
        analysisData += `Tarih: ${new Date(date).toLocaleDateString("tr-TR")}\n`;
        analysisData += `${note.content}\n\n`;
      });
    }

    // Fetch anamnesis form
    if (includeAnamnesis) {
      const anamnesisForm = await prisma.anamnesisForm.findFirst({
        where: { clientId },
        orderBy: { createdAt: "desc" }
      });

      if (anamnesisForm) {
        analysisData += "=== ANAMNEZ FORMU ===\n\n";
        
        // Sosyodemografik bilgiler
        if (anamnesisForm.firstName || anamnesisForm.lastName) {
          analysisData += `Ad Soyad: ${anamnesisForm.firstName || ""} ${anamnesisForm.lastName || ""}\n`;
        }
        if (anamnesisForm.age) analysisData += `Yaş: ${anamnesisForm.age}\n`;
        if (anamnesisForm.education) analysisData += `Eğitim: ${anamnesisForm.education}\n`;
        if (anamnesisForm.maritalStatus) analysisData += `Medeni Durum: ${anamnesisForm.maritalStatus}\n`;
        
        // Şikayetler ve geçmiş
        if (anamnesisForm.currentComplaint) analysisData += `\nGüncel Şikayet: ${anamnesisForm.currentComplaint}\n`;
        if (anamnesisForm.currentComplaintHistory) analysisData += `Şikayet Geçmişi: ${anamnesisForm.currentComplaintHistory}\n`;
        if (anamnesisForm.pastComplaintHistory) analysisData += `Geçmiş Şikayetler: ${anamnesisForm.pastComplaintHistory}\n`;
        
        // Mental durum
        if (anamnesisForm.mood) analysisData += `\nDuygudurum: ${anamnesisForm.mood}\n`;
        if (anamnesisForm.affect) analysisData += `Duygulanım: ${anamnesisForm.affect}\n`;
        
        // Tanı ve tedavi
        if (anamnesisForm.diagnosis) analysisData += `\nTanı: ${anamnesisForm.diagnosis}\n`;
        if (anamnesisForm.treatmentPlan) analysisData += `Tedavi Planı: ${anamnesisForm.treatmentPlan}\n`;
        
        analysisData += "\n";
      }
    }

    // Call AI API for comprehensive analysis
    const aiApiKey = process.env.ABACUSAI_API_KEY;
    if (!aiApiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const aiResponse = await fetch("https://apis.abacus.ai/chatllm/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sen deneyimli bir klinik psikologsun. Sana verilen danışan bilgilerini (test sonuçları, seans notları, anamnez formu) kapsamlı bir şekilde analiz et ve profesyonel bir değerlendirme yap. Analiz şunları içermeli: 1) Genel değerlendirme 2) Önemli bulgular 3) Ruh sağlığı durumu 4) Tedavi önerileri 5) Dikkat edilmesi gereken noktalar. Türkçe yanıt ver."
          },
          {
            role: "user",
            content: analysisData
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const analysis = aiResult.choices?.[0]?.message?.content || "Analiz yapılamadı";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Comprehensive AI analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
