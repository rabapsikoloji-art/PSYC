"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { TestQuestion } from "@/lib/test-data";
import { useRouter } from "next/navigation";

interface TestFormProps {
  testType: "BECK_DEPRESSION" | "BECK_ANXIETY" | "SCL_90" | "MMPI" | "OTOMATIK_DUSUNCELER";
  testTitle: string;
  questions: TestQuestion[];
  clientId?: string;
}

export function TestForm({ testType, testTitle, questions, clientId }: TestFormProps) {
  // Use array for Beck tests, object for others
  const usesArrayResponse = testType === "BECK_DEPRESSION" || testType === "BECK_ANXIETY";
  const [arrayResponses, setArrayResponses] = useState<number[]>(new Array(questions.length).fill(-1));
  const [objectResponses, setObjectResponses] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleArrayResponseChange = (questionIndex: number, value: number) => {
    const newResponses = [...arrayResponses];
    newResponses[questionIndex] = value;
    setArrayResponses(newResponses);
  };

  const handleObjectResponseChange = (questionId: number, value: number) => {
    setObjectResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isComplete = usesArrayResponse 
    ? arrayResponses.every(r => r >= 0)
    : questions.every(q => objectResponses[q.id] !== undefined);

  const getCompletedCount = () => {
    if (usesArrayResponse) {
      return arrayResponses.filter(r => r >= 0).length;
    } else {
      return Object.keys(objectResponses).length;
    }
  };

  const handleAutoFill = () => {
    if (usesArrayResponse) {
      // For Beck tests, fill with random values 0-3
      const newResponses = questions.map(() => Math.floor(Math.random() * 4));
      setArrayResponses(newResponses);
    } else {
      // For other tests, fill with random option values
      const newResponses: { [key: number]: number } = {};
      questions.forEach((question) => {
        const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
        newResponses[question.id] = randomOption.value;
      });
      setObjectResponses(newResponses);
    }
    setError("");
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      setError("Lütfen tüm soruları cevaplayın");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          responses: usesArrayResponse ? arrayResponses : objectResponses,
          clientId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Test gönderilemedi");
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(clientId ? "/dashboard/tests" : "/client/tests");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h3 className="text-2xl font-semibold">Test Tamamlandı!</h3>
            <p className="text-gray-600 text-center">
              Testiniz başarıyla kaydedildi. Sonuçlarınızı görüntülemek için yönlendiriliyorsunuz...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{testTitle}</CardTitle>
          <CardDescription>
            Lütfen her bir ifadeyi dikkatlice okuyun ve son 2 hafta içindeki durumunuzu en iyi yansıtan seçeneği işaretleyin.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => {
          const questionText = question.text || question.question || "";
          const currentValue = usesArrayResponse 
            ? arrayResponses[index]?.toString() 
            : objectResponses[question.id]?.toString();
          
          return (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {question.id}. {questionText}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={currentValue || ""}
                  onValueChange={(value) => {
                    if (usesArrayResponse) {
                      handleArrayResponseChange(index, parseInt(value));
                    } else {
                      handleObjectResponseChange(question.id, parseInt(value));
                    }
                  }}
                >
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem 
                          value={option.value.toString()} 
                          id={`q${question.id}-${option.value}`} 
                        />
                        <Label 
                          htmlFor={`q${question.id}-${option.value}`}
                          className="font-normal cursor-pointer leading-tight"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg sticky bottom-0">
        <div className="text-sm text-gray-600">
          Tamamlanan: {getCompletedCount()} / {questions.length}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleAutoFill}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Otomatik Doldur
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? "Gönderiliyor..." : "Testi Tamamla"}
          </Button>
        </div>
      </div>
    </div>
  );
}
