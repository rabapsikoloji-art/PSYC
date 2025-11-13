import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { TestResultsDetail } from "@/components/tests/test-results-detail";

export default async function DashboardTestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["PSYCHOLOGIST", "ADMINISTRATOR", "COORDINATOR"].includes(session.user.role)) {
    redirect("/auth/signin");
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
    redirect("/dashboard/tests");
  }

  return (
    
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Test Sonuçları</h1>
        </div>

        <TestResultsDetail test={test} userRole={session.user.role} />
      </div>
    
  );
}
