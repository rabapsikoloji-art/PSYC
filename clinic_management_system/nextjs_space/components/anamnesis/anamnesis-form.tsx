
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Upload, Save, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AnamnesisFormProps {
  clientId: string;
  clientName: string;
  onSave?: () => void;
}

export function AnamnesisForm({ clientId, clientName, onSave }: AnamnesisFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [existingForm, setExistingForm] = useState<any>(null);
  const [formData, setFormData] = useState({
    // 1) Sosyodemografik Bilgiler
    firstName: "",
    lastName: "",
    age: "",
    education: "",
    maritalStatus: "",
    employmentStatus: "",
    numberOfChildren: "",
    residence: "",
    livingWith: "",
    
    // 2-8) Öykü bilgileri
    currentComplaint: "",
    currentComplaintHistory: "",
    pastComplaintHistory: "",
    pastLifeHistory: "",
    substanceMedicationHistory: "",
    generalMedicalCondition: "",
    familyMedicalHistory: "",
    
    // 9) Mental Durum Değerlendirmesi
    selfCare: "",
    speech: "",
    psychomotorActivity: "",
    affect: "",
    mood: "",
    thought: "",
    perception: "",
    behavior: "",
    insight: "",
    
    // 10) Bilişsel İşlevler
    attention: "",
    memory: "",
    calculation: "",
    drawing: "",
    abstraction: "",
    executiveFunctions: "",
    orientation: "",
    
    // 11-14) Tanı ve Tedavi
    technicalSummary: "",
    differentialDiagnosis: "",
    diagnosis: "",
    treatmentPlan: "",
    
    // Ekstra
    extraQuestions: "",
  });

  useEffect(() => {
    loadExistingForm();
  }, [clientId]);

  const loadExistingForm = async () => {
    try {
      const response = await fetch(`/api/anamnesis?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const latest = data[0];
          setExistingForm(latest);
          setFormData({
            firstName: latest.firstName || "",
            lastName: latest.lastName || "",
            age: latest.age?.toString() || "",
            education: latest.education || "",
            maritalStatus: latest.maritalStatus || "",
            employmentStatus: latest.employmentStatus || "",
            numberOfChildren: latest.numberOfChildren?.toString() || "",
            residence: latest.residence || "",
            livingWith: latest.livingWith || "",
            currentComplaint: latest.currentComplaint || "",
            currentComplaintHistory: latest.currentComplaintHistory || "",
            pastComplaintHistory: latest.pastComplaintHistory || "",
            pastLifeHistory: latest.pastLifeHistory || "",
            substanceMedicationHistory: latest.substanceMedicationHistory || "",
            generalMedicalCondition: latest.generalMedicalCondition || "",
            familyMedicalHistory: latest.familyMedicalHistory || "",
            selfCare: latest.selfCare || "",
            speech: latest.speech || "",
            psychomotorActivity: latest.psychomotorActivity || "",
            affect: latest.affect || "",
            mood: latest.mood || "",
            thought: latest.thought || "",
            perception: latest.perception || "",
            behavior: latest.behavior || "",
            insight: latest.insight || "",
            attention: latest.attention || "",
            memory: latest.memory || "",
            calculation: latest.calculation || "",
            drawing: latest.drawing || "",
            abstraction: latest.abstraction || "",
            executiveFunctions: latest.executiveFunctions || "",
            orientation: latest.orientation || "",
            technicalSummary: latest.technicalSummary || "",
            differentialDiagnosis: latest.differentialDiagnosis || "",
            diagnosis: latest.diagnosis || "",
            treatmentPlan: latest.treatmentPlan || "",
            extraQuestions: latest.extraQuestions || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading anamnesis form:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        clientId,
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        numberOfChildren: formData.numberOfChildren ? parseInt(formData.numberOfChildren) : null,
      };

      const url = existingForm ? "/api/anamnesis" : "/api/anamnesis";
      const method = existingForm ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingForm ? { id: existingForm.id, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error("Form kaydedilemedi");
      }

      toast.success(existingForm ? "Anamnez formu güncellendi" : "Anamnez formu kaydedildi");
      await loadExistingForm();
      onSave?.();
    } catch (error) {
      console.error("Error saving anamnesis form:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Sadece Word dosyalarını kabul et
    if (!file.name.match(/\.(doc|docx)$/i)) {
      toast.error("Lütfen Word dosyası (.doc veya .docx) yükleyin");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("clientId", clientId);
      if (existingForm?.id) {
        formDataUpload.append("anamnesisId", existingForm.id);
      }

      const response = await fetch("/api/anamnesis/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Dosya yüklenemedi");
      }

      toast.success("Word dosyası başarıyla yüklendi");
      await loadExistingForm();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Dosya yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!existingForm?.uploadedFile) return;

    try {
      const response = await fetch(`/api/anamnesis/download?path=${encodeURIComponent(existingForm.uploadedFile)}`);
      if (!response.ok) throw new Error("Dosya indirilemedi");
      
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Dosya indirilirken bir hata oluştu");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Anamnez Formu - {clientName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Danışan için detaylı anamnez formu doldurabilir veya Word dosyası yükleyebilirsiniz
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Kaydediliyor..." : existingForm ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Word Dosyası Upload */}
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Word Dosyası Yükle</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Anamnez formunu Word dosyası olarak yükleyebilirsiniz (.doc veya .docx)
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Yükleniyor..." : "Dosya Seç"}
                    <input
                      type="file"
                      accept=".doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
                {existingForm?.uploadedFile && (
                  <Button variant="outline" size="sm" onClick={handleDownloadFile}>
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Form Tabs */}
          <Tabs defaultValue="demographic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="demographic">Demografik</TabsTrigger>
              <TabsTrigger value="history">Öykü</TabsTrigger>
              <TabsTrigger value="mental">Mental Durum</TabsTrigger>
              <TabsTrigger value="cognitive">Bilişsel</TabsTrigger>
              <TabsTrigger value="diagnosis">Tanı & Tedavi</TabsTrigger>
            </TabsList>

            {/* Tab 1: Sosyodemografik Bilgiler */}
            <TabsContent value="demographic" className="space-y-4">
              <h3 className="text-lg font-semibold">Sosyodemografik Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Yaş</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="education">Eğitim Durumu</Label>
                  <Select
                    value={formData.education}
                    onValueChange={(value) => handleInputChange("education", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ilkokul">İlkokul</SelectItem>
                      <SelectItem value="ortaokul">Ortaokul</SelectItem>
                      <SelectItem value="lise">Lise</SelectItem>
                      <SelectItem value="universite">Üniversite</SelectItem>
                      <SelectItem value="yuksek-lisans">Yüksek Lisans</SelectItem>
                      <SelectItem value="doktora">Doktora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Medeni Durum</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleInputChange("maritalStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bekar">Bekar</SelectItem>
                      <SelectItem value="evli">Evli</SelectItem>
                      <SelectItem value="bosanmis">Boşanmış</SelectItem>
                      <SelectItem value="dul">Dul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentStatus">Çalışma Durumu</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => handleInputChange("employmentStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calisiyor">Çalışıyor</SelectItem>
                      <SelectItem value="calismiyor">Çalışmıyor</SelectItem>
                      <SelectItem value="ogrenci">Öğrenci</SelectItem>
                      <SelectItem value="emekli">Emekli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numberOfChildren">Çocuk Sayısı</Label>
                  <Input
                    id="numberOfChildren"
                    type="number"
                    value={formData.numberOfChildren}
                    onChange={(e) => handleInputChange("numberOfChildren", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="residence">İkamet</Label>
                  <Input
                    id="residence"
                    value={formData.residence}
                    onChange={(e) => handleInputChange("residence", e.target.value)}
                    placeholder="Şehir, ilçe"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="livingWith">Kimlerle Yaşıyor</Label>
                  <Input
                    id="livingWith"
                    value={formData.livingWith}
                    onChange={(e) => handleInputChange("livingWith", e.target.value)}
                    placeholder="Örn: Eşi ve çocukları ile"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Öykü */}
            <TabsContent value="history" className="space-y-4">
              <h3 className="text-lg font-semibold">Öykü Bilgileri</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentComplaint">Şimdiki Rahatsızlığın Şikayeti</Label>
                  <Textarea
                    id="currentComplaint"
                    value={formData.currentComplaint}
                    onChange={(e) => handleInputChange("currentComplaint", e.target.value)}
                    rows={3}
                    placeholder="Danışanın şu anki şikayetlerini detaylı yazınız..."
                  />
                </div>
                <div>
                  <Label htmlFor="currentComplaintHistory">Şimdiki Şikayetinin Öyküsü</Label>
                  <Textarea
                    id="currentComplaintHistory"
                    value={formData.currentComplaintHistory}
                    onChange={(e) => handleInputChange("currentComplaintHistory", e.target.value)}
                    rows={4}
                    placeholder="Şikayetin başlangıcı, gelişimi, süresi..."
                  />
                </div>
                <div>
                  <Label htmlFor="pastComplaintHistory">Geçmiş Şikayetinin Öyküsü</Label>
                  <Textarea
                    id="pastComplaintHistory"
                    value={formData.pastComplaintHistory}
                    onChange={(e) => handleInputChange("pastComplaintHistory", e.target.value)}
                    rows={4}
                    placeholder="Önceki psikolojik/psikiyatrik şikayetler..."
                  />
                </div>
                <div>
                  <Label htmlFor="pastLifeHistory">Geçmiş Yaşantısının Öyküsü</Label>
                  <Textarea
                    id="pastLifeHistory"
                    value={formData.pastLifeHistory}
                    onChange={(e) => handleInputChange("pastLifeHistory", e.target.value)}
                    rows={4}
                    placeholder="Çocukluk, ergenlik, aile ilişkileri, travmalar..."
                  />
                </div>
                <div>
                  <Label htmlFor="substanceMedicationHistory">Madde ve İlaç Kullanım Öyküsü</Label>
                  <Textarea
                    id="substanceMedicationHistory"
                    value={formData.substanceMedicationHistory}
                    onChange={(e) => handleInputChange("substanceMedicationHistory", e.target.value)}
                    rows={3}
                    placeholder="Kullanılan ilaçlar, madde kullanım öyküsü..."
                  />
                </div>
                <div>
                  <Label htmlFor="generalMedicalCondition">Genel Tıbbi Durum</Label>
                  <Textarea
                    id="generalMedicalCondition"
                    value={formData.generalMedicalCondition}
                    onChange={(e) => handleInputChange("generalMedicalCondition", e.target.value)}
                    rows={3}
                    placeholder="Kronik hastalıklar, geçirilmiş ameliyatlar..."
                  />
                </div>
                <div>
                  <Label htmlFor="familyMedicalHistory">Ailenin Geçmiş Hastalık Öyküsü</Label>
                  <Textarea
                    id="familyMedicalHistory"
                    value={formData.familyMedicalHistory}
                    onChange={(e) => handleInputChange("familyMedicalHistory", e.target.value)}
                    rows={3}
                    placeholder="Ailede psikiyatrik/psikolojik hastalık öyküsü..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Mental Durum */}
            <TabsContent value="mental" className="space-y-4">
              <h3 className="text-lg font-semibold">Mental Durum Değerlendirmesi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selfCare">Özbakım</Label>
                  <Select
                    value={formData.selfCare}
                    onValueChange={(value) => handleInputChange("selfCare", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iyi">İyi</SelectItem>
                      <SelectItem value="orta">Orta</SelectItem>
                      <SelectItem value="zayif">Zayıf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="speech">Konuşma</Label>
                  <Select
                    value={formData.speech}
                    onValueChange={(value) => handleInputChange("speech", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hizli">Hızlı</SelectItem>
                      <SelectItem value="yavas">Yavaş</SelectItem>
                      <SelectItem value="baski-altinda">Baskı Altında</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="psychomotorActivity">Psikomotor Aktivite</Label>
                  <Select
                    value={formData.psychomotorActivity}
                    onValueChange={(value) => handleInputChange("psychomotorActivity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="artmis">Artmış</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="retarde">Retarde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="affect">Duygulanım (Affect)</Label>
                  <Select
                    value={formData.affect}
                    onValueChange={(value) => handleInputChange("affect", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uygun">Uygun</SelectItem>
                      <SelectItem value="kis%C4%B1tl%C4%B1">Kısıtlı</SelectItem>
                      <SelectItem value="kuesune">Küsüne</SelectItem>
                      <SelectItem value="labil">Labil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mood">Duygu Durum (Mood)</Label>
                  <Select
                    value={formData.mood}
                    onValueChange={(value) => handleInputChange("mood", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otimik">Ötimik</SelectItem>
                      <SelectItem value="depresif">Depresif</SelectItem>
                      <SelectItem value="anksiyoz">Anksiyöz</SelectItem>
                      <SelectItem value="irritabl">İrritabl</SelectItem>
                      <SelectItem value="offorik">Öfforik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="thought">Düşünce</Label>
                  <Input
                    id="thought"
                    value={formData.thought}
                    onChange={(e) => handleInputChange("thought", e.target.value)}
                    placeholder="Düşünce içeriği ve akışı"
                  />
                </div>
                <div>
                  <Label htmlFor="perception">Algı</Label>
                  <Input
                    id="perception"
                    value={formData.perception}
                    onChange={(e) => handleInputChange("perception", e.target.value)}
                    placeholder="Halüsinasyon, illüzyon varlığı"
                  />
                </div>
                <div>
                  <Label htmlFor="behavior">Davranış</Label>
                  <Input
                    id="behavior"
                    value={formData.behavior}
                    onChange={(e) => handleInputChange("behavior", e.target.value)}
                    placeholder="Gözlenen davranışlar"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="insight">İçgörü</Label>
                  <Select
                    value={formData.insight}
                    onValueChange={(value) => handleInputChange("insight", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tam">Tam</SelectItem>
                      <SelectItem value="kismi">Kısmi</SelectItem>
                      <SelectItem value="yok">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Bilişsel İşlevler */}
            <TabsContent value="cognitive" className="space-y-4">
              <h3 className="text-lg font-semibold">Bilişsel İşlevler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="attention">Dikkat</Label>
                  <Select
                    value={formData.attention}
                    onValueChange={(value) => handleInputChange("attention", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="bozuk">Bozuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="memory">Bellek</Label>
                  <Select
                    value={formData.memory}
                    onValueChange={(value) => handleInputChange("memory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="bozuk">Bozuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calculation">Hesaplama</Label>
                  <Select
                    value={formData.calculation}
                    onValueChange={(value) => handleInputChange("calculation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="bozuk">Bozuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drawing">Çizim</Label>
                  <Select
                    value={formData.drawing}
                    onValueChange={(value) => handleInputChange("drawing", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="bozuk">Bozuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="abstraction">Soyutlama</Label>
                  <Select
                    value={formData.abstraction}
                    onValueChange={(value) => handleInputChange("abstraction", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="bozuk">Bozuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="executiveFunctions">Yürütücü İşlevler</Label>
                  <Select
                    value={formData.executiveFunctions}
                    onValueChange={(value) => handleInputChange("executiveFunctions", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="azalmis">Azalmış</SelectItem>
                      <SelectItem value="bozuk">Bozuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="orientation">Oryantasyon</Label>
                  <Input
                    id="orientation"
                    value={formData.orientation}
                    onChange={(e) => handleInputChange("orientation", e.target.value)}
                    placeholder="Zaman, yer, kişi oryantasyonu"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 5: Tanı ve Tedavi */}
            <TabsContent value="diagnosis" className="space-y-4">
              <h3 className="text-lg font-semibold">Tanı ve Tedavi Planı</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="technicalSummary">Öykünün Teknik Özetlemesi</Label>
                  <Textarea
                    id="technicalSummary"
                    value={formData.technicalSummary}
                    onChange={(e) => handleInputChange("technicalSummary", e.target.value)}
                    rows={4}
                    placeholder="Danışanın durumunun teknik özeti..."
                  />
                </div>
                <div>
                  <Label htmlFor="differentialDiagnosis">Ayırıcı Tanı</Label>
                  <Textarea
                    id="differentialDiagnosis"
                    value={formData.differentialDiagnosis}
                    onChange={(e) => handleInputChange("differentialDiagnosis", e.target.value)}
                    rows={3}
                    placeholder="Düşünülen alternatif tanılar..."
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosis">Tanı</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                    rows={3}
                    placeholder="Konulan tanı/tanılar..."
                  />
                </div>
                <div>
                  <Label htmlFor="treatmentPlan">Tedavi Planı</Label>
                  <Textarea
                    id="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={(e) => handleInputChange("treatmentPlan", e.target.value)}
                    rows={4}
                    placeholder="Önerilen tedavi yaklaşımı, seans sıklığı, hedefler..."
                  />
                </div>
                <div>
                  <Label htmlFor="extraQuestions">Ekstra Sorular / Notlar</Label>
                  <Textarea
                    id="extraQuestions"
                    value={formData.extraQuestions}
                    onChange={(e) => handleInputChange("extraQuestions", e.target.value)}
                    rows={3}
                    placeholder="İlave bilgiler, sorular, notlar..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
