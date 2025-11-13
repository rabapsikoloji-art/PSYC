
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, MessageSquare, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationsSettings } from "@/components/integrations/integrations-settings";

interface SettingsViewProps {
  userRole: string;
}

interface Settings {
  whatsappApiEnabled: boolean;
  whatsappApiKey?: string;
  whatsappPhoneNumber?: string;
  reminderEnabled: boolean;
  reminderHoursBefore: number;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  iban: string;
}

export function SettingsView({ userRole }: SettingsViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    whatsappApiEnabled: false,
    whatsappApiKey: '',
    whatsappPhoneNumber: '',
    reminderEnabled: false,
    reminderHoursBefore: 24,
    clinicName: 'Raba Psikoloji',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    iban: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Ayarlar kaydedildi!');
      } else {
        toast.error('Ayarlar kaydedilemedi!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Bir hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    if (!settings.whatsappApiKey || !settings.whatsappPhoneNumber) {
      toast.error('Lütfen WhatsApp API anahtarı ve telefon numarası girin!');
      return;
    }

    toast.info('WhatsApp bağlantısı test ediliyor...');
    
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.whatsappApiKey,
          phoneNumber: settings.whatsappPhoneNumber
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('WhatsApp bağlantısı başarılı! ✓');
      } else {
        toast.error(data.error || 'Bağlantı başarısız!');
      }
    } catch (error) {
      toast.error('Bağlantı test edilemedi!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-teal-100 rounded-xl">
          <Settings className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ayarlar</h2>
          <p className="text-gray-600">Sistem ayarlarını yönetin</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Genel Ayarlar</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="integrations">Entegrasyonlar</TabsTrigger>
          <TabsTrigger value="payment">Ödeme Bilgileri</TabsTrigger>
        </TabsList>

        {/* Genel Ayarlar */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Klinik Bilgileri</CardTitle>
              <CardDescription>
                Klinik hakkında genel bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Klinik Adı</Label>
                <Input
                  id="clinicName"
                  value={settings.clinicName}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                  placeholder="Klinik adı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Adres</Label>
                <Textarea
                  id="clinicAddress"
                  value={settings.clinicAddress}
                  onChange={(e) => setSettings({ ...settings, clinicAddress: e.target.value })}
                  placeholder="Klinik adresi"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Telefon</Label>
                  <Input
                    id="clinicPhone"
                    value={settings.clinicPhone}
                    onChange={(e) => setSettings({ ...settings, clinicPhone: e.target.value })}
                    placeholder="+90 555 000 00 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">E-posta</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={settings.clinicEmail}
                    onChange={(e) => setSettings({ ...settings, clinicEmail: e.target.value })}
                    placeholder="info@klinik.com"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bildirimler */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Hatırlatma Ayarları
              </CardTitle>
              <CardDescription>
                Otomatik randevu hatırlatmalarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reminderEnabled">Otomatik Hatırlatmalar</Label>
                  <p className="text-sm text-gray-500">
                    Randevulardan önce otomatik hatırlatma mesajları gönder
                  </p>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={settings.reminderEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminderEnabled: checked })}
                />
              </div>

              {settings.reminderEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminderHoursBefore">Kaç saat önce hatırlat?</Label>
                  <Input
                    id="reminderHoursBefore"
                    type="number"
                    min="1"
                    max="72"
                    value={settings.reminderHoursBefore}
                    onChange={(e) => setSettings({ ...settings, reminderHoursBefore: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-gray-500">
                    Randevudan {settings.reminderHoursBefore} saat önce hatırlatma gönderilecek
                  </p>
                </div>
              )}

              <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Entegrasyonu
              </CardTitle>
              <CardDescription>
                WhatsApp Business API ile otomatik mesaj gönderimi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="whatsappApiEnabled">WhatsApp API Aktif</Label>
                  <p className="text-sm text-gray-500">
                    WhatsApp üzerinden otomatik mesaj göndermeyi etkinleştir
                  </p>
                </div>
                <Switch
                  id="whatsappApiEnabled"
                  checked={settings.whatsappApiEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, whatsappApiEnabled: checked })}
                />
              </div>

              {settings.whatsappApiEnabled && (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">WhatsApp Business API Nasıl Alınır?</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>
                        <a 
                          href="https://business.whatsapp.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-600"
                        >
                          WhatsApp Business
                        </a> hesabı oluşturun
                      </li>
                      <li>Veya üçüncü parti sağlayıcılardan (Twilio, Wati.io, Netgsm) API anahtarı alın</li>
                      <li>API anahtarınızı ve telefon numaranızı aşağıya girin</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappApiKey">WhatsApp API Anahtarı</Label>
                    <Input
                      id="whatsappApiKey"
                      type="password"
                      value={settings.whatsappApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappApiKey: e.target.value })}
                      placeholder="API anahtarınızı girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappPhoneNumber">WhatsApp Telefon Numarası</Label>
                    <Input
                      id="whatsappPhoneNumber"
                      value={settings.whatsappPhoneNumber || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappPhoneNumber: e.target.value })}
                      placeholder="+905550000000"
                    />
                    <p className="text-sm text-gray-500">
                      Ülke kodu ile birlikte (örn: +905550000000)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={testWhatsAppConnection}
                      disabled={!settings.whatsappApiKey || !settings.whatsappPhoneNumber}
                    >
                      Bağlantıyı Test Et
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Kaydet
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entegrasyonlar */}
        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>

        {/* Ödeme Bilgileri */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Bilgileri</CardTitle>
              <CardDescription>
                Danışanlara gösterilecek ödeme bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={settings.iban}
                  onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
                <p className="text-sm text-gray-500">
                  Danışanların ödeme yapabileceği IBAN numarası
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
