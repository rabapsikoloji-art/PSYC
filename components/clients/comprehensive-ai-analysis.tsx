
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Brain, FileText, ClipboardList, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ComprehensiveAIAnalysisProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

interface Test {
  id: string;
  testType: string;
  totalScore: number;
  severity: string;
  completedAt: string;
  createdAt: string;
}

interface SessionNote {
  id: string;
  content: string;
  createdAt: string;
  appointment?: {
    appointmentDate: string;
  };
}

interface AnamnesisForm {
  id: string;
  createdAt: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

export function ComprehensiveAIAnalysis({
  open,
  onClose,
  clientId,
  clientName,
}: ComprehensiveAIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [anamnesisForm, setAnamnesisForm] = useState<AnamnesisForm | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [includeAnamnesis, setIncludeAnamnesis] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, clientId]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      // Fetch tests
      const testsRes = await fetch(`/api/tests?clientId=${clientId}`);
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setTests(testsData);
      }

      // Fetch session notes
      const notesRes = await fetch(`/api/session-notes?clientId=${clientId}`);
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setSessionNotes(notesData);
      }

      // Fetch anamnesis form
      const anamnesisRes = await fetch(`/api/anamnesis?clientId=${clientId}`);
      if (anamnesisRes.ok) {
        const anamnesisData = await anamnesisRes.json();
        if (anamnesisData && anamnesisData.length > 0) {
          setAnamnesisForm(anamnesisData[0]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setDataLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedTests.length === 0 && selectedNotes.length === 0 && !includeAnamnesis) {
      toast.error("Lütfen en az bir öğe seçin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai-analysis/comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          testIds: selectedTests,
          sessionNoteIds: selectedNotes,
          includeAnamnesis,
        }),
      });

      if (!response.ok) {
        throw new Error("Analiz yapılamadı");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      toast.success("AI analizi tamamlandı!");
    } catch (error: any) {
      console.error("Error analyzing:", error);
      toast.error(error.message || "Analiz yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnalysisResult("");
    setSelectedTests([]);
    setSelectedNotes([]);
    setIncludeAnamnesis(false);
    onClose();
  };

  const getTestTypeName = (testType: string) => {
    const typeMap: Record<string, string> = {
      BECK_DEPRESSION: "Beck Depresyon",
      BECK_ANXIETY: "Beck Anksiyete",
      SCL_90: "SCL-90-R",
      MMPI: "MMPI",
      OTOMATIK_DUSUNCELER: "Otomatik Düşünceler"
    };
    return typeMap[testType] || testType;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Kapsamlı AI Analizi - {clientName}
          </DialogTitle>
          <DialogDescription>
            Danışan hakkında test sonuçları, seans notları ve anamnez formunu seçerek kapsamlı bir AI analizi yapın
          </DialogDescription>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tests Selection */}
            {tests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Test Sonuçları ({tests.length})
                  </CardTitle>
                  <CardDescription>
                    Analize dahil edilecek testleri seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tests.map((test) => (
                    <div key={test.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`test-${test.id}`}
                        checked={selectedTests.includes(test.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTests([...selectedTests, test.id]);
                          } else {
                            setSelectedTests(selectedTests.filter((id) => id !== test.id));
                          }
                        }}
                      />
                      <Label htmlFor={`test-${test.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{getTestTypeName(test.testType)}</div>
                        <div className="text-sm text-gray-500">
                          Puan: {test.totalScore} • {test.severity} • {format(new Date(test.completedAt || test.createdAt), "d MMM yyyy", { locale: tr })}
                        </div>
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Session Notes Selection */}
            {sessionNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Seans Notları ({sessionNotes.length})
                  </CardTitle>
                  <CardDescription>
                    Analize dahil edilecek seans notlarını seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                  {sessionNotes.map((note) => (
                    <div key={note.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`note-${note.id}`}
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotes([...selectedNotes, note.id]);
                          } else {
                            setSelectedNotes(selectedNotes.filter((id) => id !== note.id));
                          }
                        }}
                      />
                      <Label htmlFor={`note-${note.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm line-clamp-2">{note.content.substring(0, 100)}...</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(note.appointment?.appointmentDate || note.createdAt), "d MMM yyyy", { locale: tr })}
                        </div>
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Anamnesis Form Selection */}
            {anamnesisForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Anamnez Formu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="anamnesis"
                      checked={includeAnamnesis}
                      onCheckedChange={(checked) => setIncludeAnamnesis(checked as boolean)}
                    />
                    <Label htmlFor="anamnesis" className="flex-1 cursor-pointer">
                      <div className="font-medium">Anamnez Formu</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(anamnesisForm.createdAt), "d MMM yyyy", { locale: tr })}
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Result */}
            {analysisResult && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-base text-purple-900">Analiz Sonucu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </CardContent>
              </Card>
            )}

            {tests.length === 0 && sessionNotes.length === 0 && !anamnesisForm && (
              <div className="text-center py-8 text-gray-500">
                Bu danışan için henüz test, seans notu veya anamnez formu bulunmuyor
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Kapat
          </Button>
          {!analysisResult && (
            <Button
              onClick={handleAnalyze}
              disabled={loading || dataLoading || (selectedTests.length === 0 && selectedNotes.length === 0 && !includeAnamnesis)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Analiz Ediliyor..." : "AI Analizi Yap"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
