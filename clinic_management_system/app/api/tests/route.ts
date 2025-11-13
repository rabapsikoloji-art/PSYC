
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { 
  calculateTestScore, 
  calculateSCL90Score, 
  calculateMMPIScore, 
  calculateOtomatikDusuncelerScore 
} from "@/lib/test-data";

// GET - List all tests (for psychologist) or user's tests (for client)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    let tests;

    if (session.user.role === "CLIENT") {
      // Client can only see their own tests
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      });

      if (!client) {
        return NextResponse.json({ error: "Danışan bulunamadı" }, { status: 404 });
      }

      tests = await prisma.test.findMany({
        where: { clientId: client.id },
        include: {
          personnel: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (["PSYCHOLOGIST", "ADMINISTRATOR", "COORDINATOR"].includes(session.user.role)) {
      // Psychologists can see all tests or filter by client
      const where = clientId ? { clientId } : {};
      
      tests = await prisma.test.findMany({
        where,
        include: {
          client: {
            include: {
              user: {
                select: { name: true },
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
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    return NextResponse.json({ tests });
  } catch (error: any) {
    console.error("Tests GET error:", error);
    return NextResponse.json(
      { error: error.message || "Testler yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Create a new test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const body = await request.json();
    const { testType, clientId, responses, gender } = body;

    // Validate - responses can be either array or object
    if (!testType || !responses) {
      return NextResponse.json(
        { error: "Test tipi ve cevaplar gereklidir" },
        { status: 400 }
      );
    }

    let targetClientId = clientId;
    let personnelId = null;

    // If user is a client, use their client ID
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      });
      if (!client) {
        return NextResponse.json({ error: "Danışan bulunamadı" }, { status: 404 });
      }
      targetClientId = client.id;
    }

    // If user is psychologist, get their personnel ID
    if (["PSYCHOLOGIST", "ADMINISTRATOR"].includes(session.user.role)) {
      const personnel = await prisma.personnel.findUnique({
        where: { userId: session.user.id },
      });
      if (personnel) {
        personnelId = personnel.id;
      }
    }

    // Calculate score based on test type
    let totalScore: number | null = null;
    let severity: string | null = null;
    let testResults: any = null;

    if (testType === "BECK_DEPRESSION" || testType === "BECK_ANXIETY") {
      const scoreResult = calculateTestScore(responses as number[]);
      totalScore = scoreResult.totalScore;
      severity = scoreResult.severity;
    } else if (testType === "SCL_90") {
      testResults = calculateSCL90Score(responses as { [key: number]: number });
      const gsi = parseFloat(testResults.globalIndices?.GSI || "0");
      totalScore = Math.round(gsi * 100);
      severity = gsi < 1 ? "Normal" : gsi < 2 ? "Hafif" : gsi < 3 ? "Orta" : "Şiddetli";
    } else if (testType === "MMPI") {
      testResults = calculateMMPIScore(responses as { [key: number]: number }, gender || "unknown");
      severity = "Profesyonel Değerlendirme Gerekli";
    } else if (testType === "OTOMATIK_DUSUNCELER") {
      testResults = calculateOtomatikDusuncelerScore(responses as { [key: number]: number });
      totalScore = testResults.total?.score || 0;
      severity = testResults.total?.severity || "Düşük";
    }

    // Create test
    const test = await prisma.test.create({
      data: {
        clientId: targetClientId,
        personnelId,
        testType,
        responses: typeof responses === 'object' ? responses : { values: responses },
        totalScore,
        severity,
        notes: testResults ? JSON.stringify(testResults) : null,
        completedAt: new Date(),
      },
      include: {
        client: {
          include: {
            user: {
              select: { name: true },
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

    return NextResponse.json({ test }, { status: 201 });
  } catch (error: any) {
    console.error("Test POST error:", error);
    return NextResponse.json(
      { error: error.message || "Test kaydedilemedi" },
      { status: 500 }
    );
  }
}
