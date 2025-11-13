
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAnalysisButtonProps {
  testId: string;
}

export function AIAnalysisButton({ testId }: AIAnalysisButtonProps) {
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch(`/api/tests/${testId}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analiz başlatılamadı");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Stream başlatılamadı");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let partialRead = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split("\n");
        partialRead = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                buffer += content;
                setAnalysis(buffer);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setAnalyzing(false);
    } catch (error: any) {
      console.error("Analysis error:", error);
      setError(error.message || "Analiz sırasında bir hata oluştu");
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          if (!analysis && !analyzing) {
            handleAnalyze();
          }
        }}
        variant="outline"
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        AI Analizi
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Yapay Zeka Destekli Test Analizi
            </DialogTitle>
            <DialogDescription>
              Test sonuçlarının profesyonel psikolojik değerlendirmesi
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                <p className="text-sm text-gray-600">
                  Test sonuçları analiz ediliyor...
                </p>
              </div>
            </div>
          )}

          {analysis && !analyzing && (
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysis}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!analysis && !analyzing && !error && (
            <div className="text-center py-8 text-gray-500">
              Analizi başlatmak için bekleyin...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
