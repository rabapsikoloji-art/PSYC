
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function ClientTestsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin");
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  });

  if (!client) {
    redirect("/auth/signin");
  }

  const tests = await prisma.test.findMany({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testlerim</h1>
          <p className="text-gray-600 mt-1">
            Psikolojik test sonuçlarınızı görüntüleyin
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/client/tests/new?type=depression">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Beck Depresyon
            </Button>
          </Link>
          <Link href="/client/tests/new?type=anxiety">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Beck Anksiyete
            </Button>
          </Link>
          <Link href="/client/tests/new?type=scl90">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              SCL-90-R
            </Button>
          </Link>
          <Link href="/client/tests/new?type=mmpi">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              MMPI
            </Button>
          </Link>
          <Link href="/client/tests/new?type=otomatik">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Otomatik Düşünceler
            </Button>
          </Link>
        </div>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz test kaydı yok</h3>
              <p className="text-gray-600 mb-4">
                Beck Depresyon veya Beck Anksiyete testini alarak başlayın
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <Link key={test.id} href={`/client/tests/${test.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {test.testType === "BECK_DEPRESSION" ? "Beck Depresyon Envanteri" : 
                         test.testType === "BECK_ANXIETY" ? "Beck Anksiyete Envanteri" :
                         test.testType === "SCL_90" ? "SCL-90-R Belirti Tarama Listesi" :
                         test.testType === "MMPI" ? "Minnesota Çok Yönlü Kişilik Envanteri (MMPI)" :
                         test.testType === "OTOMATIK_DUSUNCELER" ? "Otomatik Düşünceler Ölçeği" :
                         "Psikolojik Test"}
                      </CardTitle>
                      <CardDescription>
                        {new Date(test.completedAt || test.createdAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        test.severity === "Minimal" ? "default" :
                        test.severity === "Hafif" ? "secondary" :
                        test.severity === "Orta" ? "outline" : "destructive"
                      }>
                        {test.severity}
                      </Badge>
                      {test.analyzedByAI && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          AI Analiz Edildi
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>Toplam Puan: <span className="font-semibold text-gray-900">{test.totalScore}</span></div>
                    {test.personnel && (
                      <div>Psikolog: <span className="font-semibold text-gray-900">{test.personnel.user.name}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
