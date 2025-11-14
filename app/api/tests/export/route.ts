import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    // Only psychologists and admins can export
    if (!["PSYCHOLOGIST", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");
    const clientId = searchParams.get("clientId");

    let tests;

    if (testId) {
      // Export single test
      tests = await prisma.test.findMany({
        where: { id: testId },
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
    } else if (clientId) {
      // Export all tests for a client
      tests = await prisma.test.findMany({
        where: { clientId },
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
      // Export all tests
      tests = await prisma.test.findMany({
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
    }

    // Prepare CSV data
    const testTypeNames: { [key: string]: string } = {
      BECK_DEPRESSION: "Beck Depresyon",
      BECK_ANXIETY: "Beck Anksiyete",
      SCL_90: "SCL-90",
      MMPI: "MMPI",
      OTOMATIK_DUSUNCELER: "Otomatik Düşünceler",
    };

    const csvRows = [
      [
        "Test ID",
        "Danışan",
        "Test Tipi",
        "Tarih",
        "Toplam Skor",
        "Şiddet",
        "Uygulayan Psikolog",
      ],
    ];

    tests.forEach((test: any) => {
      csvRows.push([
        test.id,
        test.client.user.name || "",
        testTypeNames[test.testType] || test.testType,
        test.completedAt?.toLocaleDateString("tr-TR") || "",
        test.totalScore?.toString() || "",
        test.severity || "",
        test.personnel?.user.name || "Danışan (Kendi)",
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="testler_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Test export error:", error);
    return NextResponse.json(
      { error: error.message || "Testler dışa aktarılamadı" },
      { status: 500 }
    );
  }
}
