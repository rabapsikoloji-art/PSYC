
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - AI analizlerini getir
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

    const analyses = await prisma.aIAnalysis.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Get AI analyses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Yeni AI analizi oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, selectedTests, selectedNotes, selectedAnamnesis, dateRange } = body;

    // Get personnel ID
    const personnel = await prisma.personnel.findUnique({
      where: { userId: session.user.id }
    });

    if (!personnel) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }

    // Fetch selected data
    const testsData = selectedTests && selectedTests.length > 0 
      ? await prisma.test.findMany({
          where: { 
            id: { in: selectedTests },
            clientId 
          },
          include: { personnel: true }
        })
      : [];

    const notesData = selectedNotes && selectedNotes.length > 0
      ? await prisma.sessionNote.findMany({
          where: { 
            id: { in: selectedNotes },
            clientId 
          }
        })
      : [];

    const anamnesisData = selectedAnamnesis && selectedAnamnesis.length > 0
      ? await prisma.anamnesisForm.findMany({
          where: { 
            id: { in: selectedAnamnesis },
            clientId 
          }
        })
      : [];

    // Prepare prompt for AI
    let analysisPrompt = `Lütfen aşağıdaki danışan verilerini analiz et ve kapsamlı bir psikolojik değerlendirme raporu hazırla:\n\n`;

    if (anamnesisData.length > 0) {
      analysisPrompt += `## ANAMNEZ FORMLARI\n`;
      anamnesisData.forEach((form, idx) => {
        analysisPrompt += `\n### Anamnez ${idx + 1} (${new Date(form.createdAt).toLocaleDateString('tr-TR')})\n`;
        if (form.currentComplaint) analysisPrompt += `**Şikayet:** ${form.currentComplaint}\n`;
        if (form.diagnosis) analysisPrompt += `**Tanı:** ${form.diagnosis}\n`;
        if (form.treatmentPlan) analysisPrompt += `**Tedavi Planı:** ${form.treatmentPlan}\n`;
      });
    }

    if (testsData.length > 0) {
      analysisPrompt += `\n## TEST SONUÇLARI\n`;
      testsData.forEach((test, idx) => {
        analysisPrompt += `\n### Test ${idx + 1}: ${test.testType} (${new Date(test.createdAt).toLocaleDateString('tr-TR')})\n`;
        analysisPrompt += `**Puan:** ${test.totalScore}\n`;
        analysisPrompt += `**Şiddet:** ${test.severity}\n`;
        if (test.aiAnalysis) analysisPrompt += `**Önceki Analiz:** ${test.aiAnalysis}\n`;
      });
    }

    if (notesData.length > 0) {
      analysisPrompt += `\n## SEANS NOTLARI\n`;
      notesData.forEach((note, idx) => {
        analysisPrompt += `\n### Seans ${idx + 1} (${new Date(note.createdAt).toLocaleDateString('tr-TR')})\n`;
        analysisPrompt += `${note.content}\n`;
      });
    }

    analysisPrompt += `\n\n## RAPOR İSTEĞİ\nLütfen yukarıdaki verileri kullanarak:\n1. Genel değerlendirme\n2. Güçlü yönler\n3. Gelişim alanları\n4. Öneriler\n5. Tedavi süreci hakkında öneriler\noluştur.`;

    // Call AI API
    const aiResponse = await fetch(`${process.env.ABACUSAI_API_URL || 'https://apis.abacus.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Sen deneyimli bir klinik psikologsun. Danışan verilerini analiz edip profesyonel raporlar hazırlıyorsun.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI API call failed');
    }

    const aiData = await aiResponse.json();
    const analysisContent = aiData.choices[0]?.message?.content || 'Analiz oluşturulamadı.';

    // Save analysis
    const analysis = await prisma.aIAnalysis.create({
      data: {
        clientId,
        personnelId: personnel.id,
        title: `Analiz - ${new Date().toLocaleDateString('tr-TR')}`,
        content: analysisContent,
        includedData: {
          tests: selectedTests || [],
          notes: selectedNotes || [],
          anamnesis: selectedAnamnesis || [],
          dateRange: dateRange || null
        }
      }
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Create AI analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
