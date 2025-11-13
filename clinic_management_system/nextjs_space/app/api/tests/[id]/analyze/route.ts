
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Only psychologists and admins can analyze
    if (!["PSYCHOLOGIST", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const test = await prisma.test.findUnique({
      where: { id: params.id },
      include: {
        client: {
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

    // Prepare test information for AI analysis
    const testTypeNames: { [key: string]: string } = {
      BECK_DEPRESSION: "Beck Depresyon Ölçeği",
      BECK_ANXIETY: "Beck Anksiyete Ölçeği",
      SCL_90: "SCL-90 Belirti Tarama Listesi",
      MMPI: "Minnesota Çok Yönlü Kişilik Envanteri",
      OTOMATIK_DUSUNCELER: "Otomatik Düşünceler Ölçeği",
    };

    const testInfo = `
Test Tipi: ${testTypeNames[test.testType] || test.testType}
Danışan: ${test.client.user.name}
Tarih: ${test.completedAt?.toLocaleDateString("tr-TR")}
Toplam Skor: ${test.totalScore || "N/A"}
Şiddet: ${test.severity || "N/A"}

Test Sonuçları:
${test.notes ? JSON.stringify(JSON.parse(test.notes), null, 2) : "Detaylı sonuç yok"}
`;

    // Call LLM API for analysis
    const messages = [
      {
        role: "system",
        content: `Sen deneyimli bir klinik psikologsun. Psikolojik test sonuçlarını analiz edip, profesyonel bir değerlendirme raporu hazırlıyorsun. 

Raporun şu bölümleri içermeli:
1. Test Sonuçlarının Özeti
2. Klinik Değerlendirme
3. Güçlü Yönler
4. Dikkat Edilmesi Gereken Alanlar
5. Öneriler ve Müdahale Yaklaşımları

Rapor Türkçe olmalı, profesyonel ve empatik bir dil kullanmalı.`,
      },
      {
        role: "user",
        content: `Lütfen aşağıdaki test sonuçlarını analiz et ve detaylı bir psikolojik değerlendirme raporu hazırla:\n\n${testInfo}`,
      },
    ];

    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("AI analizi başlatılamadı");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Test analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Analiz yapılamadı" },
      { status: 500 }
    );
  }
}
