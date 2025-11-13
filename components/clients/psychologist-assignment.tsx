
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCheck, Briefcase } from "lucide-react";

interface PsychologistAssignmentProps {
  clientId: string;
  clientName: string;
  currentPsychologistId?: string | null;
  onAssigned?: () => void;
}

export function PsychologistAssignment({
  clientId,
  clientName,
  currentPsychologistId,
  onAssigned,
}: PsychologistAssignmentProps) {
  const [loading, setLoading] = useState(false);
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [selectedPsychologist, setSelectedPsychologist] = useState<string>(
    currentPsychologistId || "none"
  );
  const [selectedPsychologistData, setSelectedPsychologistData] = useState<any>(null);

  useEffect(() => {
    fetchPsychologists();
  }, []);

  useEffect(() => {
    if (selectedPsychologist && selectedPsychologist !== "none") {
      const psychologist = psychologists.find((p) => p.id === selectedPsychologist);
      setSelectedPsychologistData(psychologist);
    } else {
      setSelectedPsychologistData(null);
    }
  }, [selectedPsychologist, psychologists]);

  const fetchPsychologists = async () => {
    try {
      const response = await fetch("/api/personnel/all");
      if (response.ok) {
        const data = await response.json();
        // Sadece psikologları getir
        const psychs = data.filter(
          (p: any) => p.user?.role === "PSYCHOLOGIST" && p.isActive
        );
        setPsychologists(psychs);
      }
    } catch (error) {
      console.error("Error fetching psychologists:", error);
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients/assign-psychologist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          psychologistId: selectedPsychologist === "none" ? null : selectedPsychologist,
        }),
      });

      if (!response.ok) {
        throw new Error("Psikolog ataması yapılamadı");
      }

      toast.success(
        selectedPsychologist === "none"
          ? "Psikolog ataması kaldırıldı"
          : "Psikolog başarıyla atandı"
      );
      onAssigned?.();
    } catch (error) {
      console.error("Error assigning psychologist:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Psikolog Ataması
          </CardTitle>
          <CardDescription>
            {clientName} için bir psikolog seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="psychologist">Psikolog Seçin</Label>
            <Select value={selectedPsychologist} onValueChange={setSelectedPsychologist}>
              <SelectTrigger>
                <SelectValue placeholder="Psikolog seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Atama Yok</SelectItem>
                {psychologists.map((psych) => (
                  <SelectItem key={psych.id} value={psych.id}>
                    {psych.firstName} {psych.lastName}
                    {psych.specialization && ` - ${psych.specialization}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPsychologistData && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Uzmanlık Alanı</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPsychologistData.specialization || "Belirtilmemiş"}
                  </p>
                </div>

                {selectedPsychologistData.services &&
                  selectedPsychologistData.services.length > 0 && (
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4" />
                        Sunulan Hizmetler
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPsychologistData.services.map((ps: any) => (
                          <Badge key={ps.id} variant="secondary">
                            {ps.service?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleAssign}
            disabled={loading || selectedPsychologist === currentPsychologistId}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {loading ? "Kaydediliyor..." : "Psikolog Ata"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
