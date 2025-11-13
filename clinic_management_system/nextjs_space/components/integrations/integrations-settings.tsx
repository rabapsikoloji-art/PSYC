
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, MessageCircle, Sparkles, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface IntegrationConfig {
  id?: string;
  integrationType: string;
  providerName?: string;
  config: any;
  isActive: boolean;
}

export function IntegrationsSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("whatsapp");
  
  // WhatsApp Settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappApiKey, setWhatsappApiKey] = useState("");
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("");
  
  // Google Settings
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  
  // SMS Settings
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsProvider, setSmsProvider] = useState("netgsm");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsUsername, setSmsUsername] = useState("");
  const [smsPassword, setSmsPassword] = useState("");
  
  // İyzico Settings
  const [iyzicoEnabled, setIyzicoEnabled] = useState(false);
  const [iyzicoApiKey, setIyzicoApiKey] = useState("");
  const [iyzicoSecretKey, setIyzicoSecretKey] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations");
      if (response.ok) {
        const data = await response.json();
        
        // Load WhatsApp settings
        const whatsapp = data.integrations.find((i: IntegrationConfig) => i.integrationType === "whatsapp");
        if (whatsapp) {
          setWhatsappEnabled(whatsapp.isActive);
          setWhatsappApiKey(whatsapp.config.apiKey || "");
          setWhatsappPhoneId(whatsapp.config.phoneId || "");
        }
        
        // Load Google settings
        const google = data.integrations.find((i: IntegrationConfig) => i.integrationType === "google");
        if (google) {
          setGoogleEnabled(google.isActive);
          setGoogleClientId(google.config.clientId || "");
          setGoogleClientSecret(google.config.clientSecret || "");
        }
        
        // Load SMS settings
        const sms = data.integrations.find((i: IntegrationConfig) => i.integrationType === "sms");
        if (sms) {
          setSmsEnabled(sms.isActive);
          setSmsProvider(sms.providerName || "netgsm");
          setSmsApiKey(sms.config.apiKey || "");
          setSmsUsername(sms.config.username || "");
          setSmsPassword(sms.config.password || "");
        }
        
        // Load İyzico settings
        const iyzico = data.integrations.find((i: IntegrationConfig) => i.integrationType === "payment");
        if (iyzico) {
          setIyzicoEnabled(iyzico.isActive);
          setIyzicoApiKey(iyzico.config.apiKey || "");
          setIyzicoSecretKey(iyzico.config.secretKey || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (integrationType: string, config: any, isActive: boolean, providerName?: string) => {
    setSaving(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationType,
          providerName,
          config,
          isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kayıt başarısız");
      }

      toast.success("Entegrasyon ayarları kaydedildi");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWhatsApp = () => {
    saveIntegration(
      "whatsapp",
      {
        apiKey: whatsappApiKey,
        phoneId: whatsappPhoneId,
      },
      whatsappEnabled,
      "meta"
    );
  };

  const handleSaveGoogle = () => {
    saveIntegration(
      "google",
      {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
      googleEnabled,
      "google"
    );
  };

  const handleSaveSMS = () => {
    saveIntegration(
      "sms",
      {
        apiKey: smsApiKey,
        username: smsUsername,
        password: smsPassword,
      },
      smsEnabled,
      smsProvider
    );
  };

  const handleSaveIyzico = () => {
    saveIntegration(
      "payment",
      {
        apiKey: iyzicoApiKey,
        secretKey: iyzicoSecretKey,
      },
      iyzicoEnabled,
      "iyzico"
    );
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="whatsapp" onClick={() => setActiveTab("whatsapp")}>WhatsApp</TabsTrigger>
        <TabsTrigger value="google" onClick={() => setActiveTab("google")}>Google</TabsTrigger>
        <TabsTrigger value="sms" onClick={() => setActiveTab("sms")}>SMS</TabsTrigger>
        <TabsTrigger value="payment" onClick={() => setActiveTab("payment")}>Ödeme</TabsTrigger>
      </TabsList>

      {/* WhatsApp Tab */}
      <TabsContent value="whatsapp">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>WhatsApp Business API</CardTitle>
                  <CardDescription>
                    Danışanlara otomatik WhatsApp mesajları gönderin
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
                <Badge variant={whatsappEnabled ? "default" : "secondary"}>
                  {whatsappEnabled ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                WhatsApp Business API kullanmak için Meta Business hesabı ve onaylı telefon numarası gereklidir.
                Ayarları yapılandırdıktan sonra gerçek API'ye bağlanabilirsiniz.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-api-key">API Anahtarı</Label>
                <Input
                  id="whatsapp-api-key"
                  type="password"
                  placeholder="Meta Business API Anahtarı"
                  value={whatsappApiKey}
                  onChange={(e) => setWhatsappApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone-id">Telefon Numarası ID</Label>
                <Input
                  id="whatsapp-phone-id"
                  placeholder="WhatsApp Business Telefon ID"
                  value={whatsappPhoneId}
                  onChange={(e) => setWhatsappPhoneId(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveWhatsApp}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "WhatsApp Ayarlarını Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Google Tab */}
      <TabsContent value="google">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Google Calendar & Meet</CardTitle>
                  <CardDescription>
                    Google Calendar entegrasyonu ve Meet link oluşturma
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={googleEnabled}
                  onCheckedChange={setGoogleEnabled}
                />
                <Badge variant={googleEnabled ? "default" : "secondary"}>
                  {googleEnabled ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Google OAuth kullanmak için Google Cloud Console'da proje oluşturmanız ve
                Client ID & Secret almanız gerekir. Onay süreci 1-2 hafta sürebilir.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-client-id">Client ID</Label>
                <Input
                  id="google-client-id"
                  placeholder="Google OAuth Client ID"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-client-secret">Client Secret</Label>
                <Input
                  id="google-client-secret"
                  type="password"
                  placeholder="Google OAuth Client Secret"
                  value={googleClientSecret}
                  onChange={(e) => setGoogleClientSecret(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveGoogle}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Google Ayarlarını Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SMS Tab */}
      <TabsContent value="sms">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>SMS Bildirimleri</CardTitle>
                  <CardDescription>
                    Randevu hatırlatmaları için SMS gönderin
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
                <Badge variant={smsEnabled ? "default" : "secondary"}>
                  {smsEnabled ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                SMS göndermek için Netgsm veya İletimerkezi gibi bir SMS sağlayıcısından
                hesap açmanız gerekir. API bilgilerinizi buradan girebilirsiniz.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sms-provider">SMS Sağlayıcı</Label>
                <select
                  id="sms-provider"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={smsProvider}
                  onChange={(e) => setSmsProvider(e.target.value)}
                >
                  <option value="netgsm">Netgsm</option>
                  <option value="iletimerkezi">İletimerkezi</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-username">Kullanıcı Adı</Label>
                <Input
                  id="sms-username"
                  placeholder="SMS API Kullanıcı Adı"
                  value={smsUsername}
                  onChange={(e) => setSmsUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-password">Şifre</Label>
                <Input
                  id="sms-password"
                  type="password"
                  placeholder="SMS API Şifresi"
                  value={smsPassword}
                  onChange={(e) => setSmsPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSMS}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "SMS Ayarlarını Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Payment Tab */}
      <TabsContent value="payment">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-orange-600" />
                <div>
                  <CardTitle>İyzico Ödeme Entegrasyonu</CardTitle>
                  <CardDescription>
                    Online ödeme almak için İyzico API'sini yapılandırın
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={iyzicoEnabled}
                  onCheckedChange={setIyzicoEnabled}
                />
                <Badge variant={iyzicoEnabled ? "default" : "secondary"}>
                  {iyzicoEnabled ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                İyzico ile ödeme almak için merchant hesabı oluşturmanız ve API anahtarlarınızı
                almanız gerekir. Onay süreci birkaç gün sürebilir.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iyzico-api-key">API Anahtarı</Label>
                <Input
                  id="iyzico-api-key"
                  type="password"
                  placeholder="İyzico API Anahtarı"
                  value={iyzicoApiKey}
                  onChange={(e) => setIyzicoApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iyzico-secret-key">Secret Key</Label>
                <Input
                  id="iyzico-secret-key"
                  type="password"
                  placeholder="İyzico Secret Key"
                  value={iyzicoSecretKey}
                  onChange={(e) => setIyzicoSecretKey(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveIyzico}
              disabled={saving}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Ödeme Ayarlarını Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
