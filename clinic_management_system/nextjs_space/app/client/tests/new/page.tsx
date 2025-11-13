
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { TestForm } from "@/components/tests/test-form";
import { BECK_DEPRESSION_QUESTIONS, BECK_ANXIETY_QUESTIONS, getTestData } from "@/lib/test-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewTestPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CLIENT") {
    redirect("/auth/signin");
  }

  const testType = searchParams.type || "depression";
  
  let testTypeEnum: "BECK_DEPRESSION" | "BECK_ANXIETY" | "SCL_90" | "MMPI" | "OTOMATIK_DUSUNCELER";
  let testTitle: string;
  let questions: any[];
  let instructions: string;

  if (testType === "depression") {
    testTypeEnum = "BECK_DEPRESSION";
    testTitle = "Beck Depresyon Envanteri";
    questions = BECK_DEPRESSION_QUESTIONS.map(q => ({ ...q, text: q.question || "" }));
    instructions = "Lütfen tüm soruları dürüstçe cevaplayın";
  } else if (testType === "anxiety") {
    testTypeEnum = "BECK_ANXIETY";
    testTitle = "Beck Anksiyete Envanteri";
    questions = BECK_ANXIETY_QUESTIONS.map(q => ({ ...q, text: q.question || "" }));
    instructions = "Lütfen tüm soruları dürüstçe cevaplayın";
  } else if (testType === "scl90") {
    testTypeEnum = "SCL_90";
    const testData = getTestData("SCL_90");
    testTitle = testData?.testName || "SCL-90-R";
    questions = testData?.questions || [];
    instructions = testData?.instructions || "Lütfen tüm soruları cevaplayın";
  } else if (testType === "mmpi") {
    testTypeEnum = "MMPI";
    const testData = getTestData("MMPI");
    testTitle = testData?.testName || "MMPI";
    questions = testData?.questions || [];
    instructions = testData?.instructions || "Lütfen tüm soruları cevaplayın";
  } else if (testType === "otomatik") {
    testTypeEnum = "OTOMATIK_DUSUNCELER";
    const testData = getTestData("OTOMATIK_DUSUNCELER");
    testTitle = testData?.testName || "Otomatik Düşünceler Ölçeği";
    questions = testData?.questions || [];
    instructions = testData?.instructions || "Lütfen tüm soruları cevaplayın";
  } else {
    redirect("/client/tests");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client/tests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{testTitle}</h1>
          <p className="text-gray-600 mt-1">{instructions}</p>
        </div>
      </div>

      <TestForm
        testType={testTypeEnum}
        testTitle={testTitle}
        questions={questions}
      />
    </div>
  );
}
