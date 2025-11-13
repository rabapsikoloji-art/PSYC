
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BECK_DEPRESSION_QUESTIONS, BECK_ANXIETY_QUESTIONS } from "@/lib/test-data";

export default async function TestDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      personnel: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!test || test.clientId !== client.id) {
    redirect("/client/tests");
  }

  const questions = test.testType === "BECK_DEPRESSION" 
    ? BECK_DEPRESSION_QUESTIONS 
    : BECK_ANXIETY_QUESTIONS;
  
  const responses = test.responses as number[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client/tests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {test.testType === "BECK_DEPRESSION" ? "Beck Depresyon Envanteri" : "Beck Anksiyete Envanteri"}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date(test.completedAt || test.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={
            test.severity === "Minimal" ? "default" :
            test.severity === "Hafif" ? "secondary" :
            test.severity === "Orta" ? "outline" : "destructive"
          } className="text-lg px-4 py-1">
            {test.severity}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Toplam Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{test.totalScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Şiddet Düzeyi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{test.severity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Psikolog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {test.personnel?.user.name || "Atanmadı"}
            </div>
          </CardContent>
        </Card>
      </div>

      {test.analyzedByAI && test.aiAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700">AI Analiz</Badge>
              Profesyonel Değerlendirme
            </CardTitle>
            <CardDescription>
              Bu analiz yapay zeka tarafından oluşturulmuştur ve psikolog tarafından incelenmelidir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {test.aiAnalysis}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Cevapları</CardTitle>
          <CardDescription>Verdiğiniz yanıtların detayları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const answerValue = responses[index] || 0;
              const selectedOption = question.options.find(opt => opt.value === answerValue);
              
              return (
                <div key={question.id} className="border-b pb-4 last:border-b-0">
                  <div className="font-medium mb-2">
                    {question.id}. {question.question}
                  </div>
                  <div className="text-gray-700 pl-4">
                    ➜ {selectedOption?.label || "Yanıt yok"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
