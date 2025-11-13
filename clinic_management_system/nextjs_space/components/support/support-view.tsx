
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { HeadphonesIcon, Mail, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export function SupportView() {
    const { data: session } = useSession() || {};
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
        priority: "normal"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject || !formData.message) {
            toast.error("Lütfen tüm alanları doldurun");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Destek talebi gönderilemedi");
            }

            const result = await response.json();
            toast.success(result.message || "Destek talebiniz başarıyla gönderildi");

            // Reset form
            setFormData({
                subject: "",
                message: "",
                priority: "normal"
            });
        } catch (error: any) {
            console.error("Support request error:", error);
            toast.error(error.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-100 rounded-xl">
                            <HeadphonesIcon className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                            <CardTitle>Destek Talebi Oluştur</CardTitle>
                            <CardDescription>
                                Sorunuz veya sorununuz için bize ulaşın
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="subject">Konu *</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Sorununuzu kısaca özetleyin"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="priority">Öncelik</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Öncelik seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Düşük</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">Yüksek</SelectItem>
                                    <SelectItem value="urgent">Acil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="message">Mesaj *</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Sorununuzu detaylı olarak açıklayın..."
                                rows={6}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            disabled={loading}
                        >
                            {loading ? "Gönderiliyor..." : "Destek Talebi Gönder"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>İletişim Bilgileri</CardTitle>
                        <CardDescription>
                            Bize doğrudan ulaşmak için
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="h-5 w-5 text-teal-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">E-posta</p>
                                <p className="text-sm text-gray-600">destek@klinik.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="h-5 w-5 text-teal-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Telefon</p>
                                <p className="text-sm text-gray-600">0850 123 45 67</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MessageCircle className="h-5 w-5 text-teal-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                                <p className="text-sm text-gray-600">0555 123 45 67</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sık Sorulan Sorular</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                                Randevu nasıl alabilirim?
                            </h4>
                            <p className="text-sm text-gray-600">
                                Takvim bölümünden uygun tarih ve saati seçerek randevu alabilirsiniz.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                                Ödeme nasıl yapabilirim?
                            </h4>
                            <p className="text-sm text-gray-600">
                                Randevu sonrasında nakit, kredi kartı veya havale ile ödeme yapabilirsiniz.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                                Randevumu iptal edebilir miyim?
                            </h4>
                            <p className="text-sm text-gray-600">
                                Evet, randevunuzdan en az 24 saat önce iptal edebilirsiniz.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
