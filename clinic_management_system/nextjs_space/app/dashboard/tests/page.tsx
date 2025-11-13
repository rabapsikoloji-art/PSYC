import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function DashboardTestsPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["PSYCHOLOGIST", "ADMINISTRATOR", "COORDINATOR"].includes(session.user.role)) {
    redirect("/auth/signin");
  }

  const whereClause = searchParams.clientId ? { clientId: searchParams.clientId } : {};

  const tests = await prisma.test.findMany({
    where: whereClause,
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

  const clients = await prisma.client.findMany({
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testler</h1>
          <p className="text-gray-600 mt-1">
            Danışan test sonuçlarını görüntüleyin ve analiz edin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrele</CardTitle>
          <CardDescription>Danışana göre test sonuçlarını filtreleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex gap-4">
            <Select name="clientId" defaultValue={searchParams.clientId || "all"}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Danışan Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Danışanlar</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Filtrele</Button>
            {searchParams.clientId && (
              <Link href="/dashboard/tests">
                <Button type="button" variant="outline">
                  Filtreyi Temizle
                </Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz test kaydı yok</h3>
              <p className="text-gray-600">
                Danışanlar test eklediklerinde burada görünecektir
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <Link key={test.id} href={`/dashboard/tests/${test.id}`}>
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
                      <CardDescription className="flex gap-2 items-center">
                        <span className="font-semibold">{test.client.user.name}</span>
                        •
                        <span>
                          {new Date(test.completedAt || test.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
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
