"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Phone, User, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KVKK_TEXT, ADULT_CONSENT_FORM, CHILD_CONSENT_FORM, REFERRAL_SOURCES } from "@/lib/consent-forms";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralSource: "",
    tcNo: "",
    address: "",
    accountType: "ADULT",
    kvkkConsent: false,
    consentFormAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("İsim ve soyisim gereklidir");
      return false;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Geçerli bir email adresi girin");
      return false;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError("Geçerli bir telefon numarası girin");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return false;
    }
    if (!formData.tcNo || formData.tcNo.length !== 11) {
      setError("Geçerli bir TC Kimlik No girin (11 haneli)");
      return false;
    }
    if (!formData.referralSource) {
      setError("Lütfen bizi nasıl bulduğunuzu belirtin");
      return false;
    }
    if (!formData.kvkkConsent) {
      setError("KVKK metnini onaylamanız gerekmektedir");
      return false;
    }
    if (!formData.consentFormAccepted) {
      setError("Onam formunu onaylamanız gerekmektedir");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kayıt işlemi başarısız");
      }

      // Başarılı kayıt sonrası giriş sayfasına yönlendir
      router.push("/auth/signin?registered=true");
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const consentFormText = formData.accountType === "ADULT" ? ADULT_CONSENT_FORM : CHILD_CONSENT_FORM;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Üye Ol</h2>
        <p className="text-sm text-gray-600">
          Danışan hesabı oluşturun ve hizmetlerimizden faydalanın
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hesap Tipi */}
        <div className="space-y-2">
          <Label>Hesap Tipi</Label>
          <RadioGroup
            value={formData.accountType}
            onValueChange={(value) => handleChange("accountType", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ADULT" id="adult" />
              <Label htmlFor="adult" className="font-normal cursor-pointer">
                Yetişkin Hesabı
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CHILD" id="child" />
              <Label htmlFor="child" className="font-normal cursor-pointer">
                Çocuk/Ergen Hesabı (Veli tarafından oluşturulur)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* İsim Soyisim */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">İsim *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="İsim"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Soyisim *</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Soyisim"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email ve Telefon */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="05xx xxx xx xx"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* TC Kimlik No */}
        <div className="space-y-2">
          <Label htmlFor="tcNo">TC Kimlik No *</Label>
          <Input
            id="tcNo"
            type="text"
            placeholder="12345678901"
            maxLength={11}
            value={formData.tcNo}
            onChange={(e) => handleChange("tcNo", e.target.value.replace(/\D/g, ""))}
            required
            disabled={loading}
          />
        </div>

        {/* Bizi Nasıl Buldunuz */}
        <div className="space-y-2">
          <Label htmlFor="referralSource">Bizi Nasıl Buldunuz? *</Label>
          <Select
            value={formData.referralSource}
            onValueChange={(value) => handleChange("referralSource", value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Adres */}
        <div className="space-y-2">
          <Label htmlFor="address">Adres</Label>
          <Textarea
            id="address"
            placeholder="Adres bilgilerinizi girin"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Şifreler */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Şifre *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* KVKK Onayı */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="kvkk"
              checked={formData.kvkkConsent}
              onCheckedChange={(checked) => handleChange("kvkkConsent", checked)}
              disabled={loading}
            />
            <div className="space-y-1">
              <Label htmlFor="kvkk" className="font-normal cursor-pointer leading-tight">
                KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum *
              </Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-teal-600">
                    KVKK Metnini Oku
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>KVKK Aydınlatma Metni</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {KVKK_TEXT}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Onam Formu */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consentFormAccepted}
              onCheckedChange={(checked) => handleChange("consentFormAccepted", checked)}
              disabled={loading}
            />
            <div className="space-y-1">
              <Label htmlFor="consent" className="font-normal cursor-pointer leading-tight">
                {formData.accountType === "ADULT" 
                  ? "Yetişkin Danışan Onam Formu"
                  : "Çocuk/Ergen Danışan Veli Onam Formu"}'nu okudum ve kabul ediyorum *
              </Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-teal-600">
                    Onam Formunu Oku
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>
                      {formData.accountType === "ADULT" 
                        ? "Yetişkin Danışan Onam Formu"
                        : "Çocuk/Ergen Danışan Veli Onam Formu"}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {consentFormText}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={loading}
        >
          {loading ? "Kayıt yapılıyor..." : "Üye Ol"}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Zaten hesabınız var mı?{" "}
        <a href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-medium">
          Giriş Yap
        </a>
      </div>
    </div>
  );
}
