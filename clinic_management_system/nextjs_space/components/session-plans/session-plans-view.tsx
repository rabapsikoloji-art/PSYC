
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus, Edit, Loader2, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SessionPlan {
  id: string;
  clientId: string;
  personnelId: string;
  totalSessions: number;
  completedSessions: number;
  sessionType: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    firstName: string;
    lastName: string;
    user: {
      name: string;
    };
  };
  personnel: {
    user: {
      name: string;
    };
  };
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

export function SessionPlansView() {
  const [sessionPlans, setSessionPlans] = useState<SessionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SessionPlan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    clientId: "",
    totalSessions: 10,
    sessionType: "Bireysel",
    frequency: "Haftada 1",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchSessionPlans();
    fetchClients();
  }, []);

  const fetchSessionPlans = async () => {
    try {
      const response = await fetch('/api/session-plans');
      if (response.ok) {
        const data = await response.json();
        setSessionPlans(data);
      }
    } catch (error) {
      console.error('Error fetching session plans:', error);
      toast.error('Seans planları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.clientId || !formData.totalSessions || !formData.startDate) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const response = await fetch('/api/session-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Seans planı oluşturuldu');
        setIsDialogOpen(false);
        resetForm();
        fetchSessionPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Seans planı oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating session plan:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleUpdatePlan = async (planId: string, updates: any) => {
    try {
      const response = await fetch('/api/session-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, ...updates }),
      });

      if (response.ok) {
        toast.success('Seans planı güncellendi');
        fetchSessionPlans();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Seans planı güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating session plan:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleCompletedSessionsChange = (planId: string, completedSessions: number, totalSessions: number) => {
    const status = completedSessions >= totalSessions ? "COMPLETED" : "ACTIVE";
    handleUpdatePlan(planId, { completedSessions, status });
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      totalSessions: 10,
      sessionType: "Bireysel",
      frequency: "Haftada 1",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: "",
      notes: "",
    });
    setEditingPlan(null);
  };

  const filteredPlans = sessionPlans.filter((plan) => {
    const clientName = `${plan.client.firstName} ${plan.client.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = clientName.includes(search);
    const matchesStatus = filterStatus === "all" || plan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-700">Aktif</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-700">Tamamlandı</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-700">İptal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Clock className="h-5 w-5 text-green-600" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <CalendarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Seans Planları</h2>
            <p className="text-gray-600">Danışanlarınız için tedavi planları oluşturun</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Seans Planı Oluştur</DialogTitle>
              <DialogDescription>
                Danışan için tedavi planı oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Danışan *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Danışan seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSessions">Toplam Seans Sayısı *</Label>
                  <Input
                    id="totalSessions"
                    type="number"
                    min="1"
                    value={formData.totalSessions}
                    onChange={(e) => setFormData({ ...formData, totalSessions: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Sıklık</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haftada 1">Haftada 1</SelectItem>
                      <SelectItem value="Haftada 2">Haftada 2</SelectItem>
                      <SelectItem value="Haftada 3">Haftada 3</SelectItem>
                      <SelectItem value="İki haftada 1">İki haftada 1</SelectItem>
                      <SelectItem value="Ayda 1">Ayda 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionType">Seans Türü</Label>
                <Select value={formData.sessionType} onValueChange={(value) => setFormData({ ...formData, sessionType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bireysel">Bireysel</SelectItem>
                    <SelectItem value="Çift">Çift Terapisi</SelectItem>
                    <SelectItem value="Aile">Aile Terapisi</SelectItem>
                    <SelectItem value="Grup">Grup Terapisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Bitiş Tarihi (Opsiyonel)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  placeholder="Plan hakkında notlarınızı yazın..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  İptal
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleCreatePlan}
                >
                  Oluştur
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Danışan adında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                <SelectItem value="CANCELLED">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Session Plans List */}
      <div className="grid gap-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Henüz seans planı yok</p>
              <p className="text-sm mt-2">İlk seans planınızı oluşturmak için yukarıdaki butonu kullanın</p>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => {
            const progress = (plan.completedSessions / plan.totalSessions) * 100;
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(plan.status)}
                        <CardTitle className="text-lg">
                          {plan.client.firstName} {plan.client.lastName}
                        </CardTitle>
                        {getStatusBadge(plan.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Seans Türü:</span> {plan.sessionType}
                        </div>
                        <div>
                          <span className="font-medium">Sıklık:</span> {plan.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Başlangıç:</span> {format(new Date(plan.startDate), 'd MMM yyyy', { locale: tr })}
                        </div>
                        {plan.endDate && (
                          <div>
                            <span className="font-medium">Bitiş:</span> {format(new Date(plan.endDate), 'd MMM yyyy', { locale: tr })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">İlerleme</span>
                      <span className="text-gray-600">
                        {plan.completedSessions} / {plan.totalSessions} seans
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {plan.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {plan.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Label htmlFor={`completed-${plan.id}`} className="text-sm">
                      Tamamlanan seans:
                    </Label>
                    <Input
                      id={`completed-${plan.id}`}
                      type="number"
                      min="0"
                      max={plan.totalSessions}
                      value={plan.completedSessions}
                      onChange={(e) => handleCompletedSessionsChange(plan.id, parseInt(e.target.value) || 0, plan.totalSessions)}
                      className="w-24"
                      disabled={plan.status !== "ACTIVE"}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdatePlan(plan.id, { status: plan.status === "ACTIVE" ? "CANCELLED" : "ACTIVE" })}
                    >
                      {plan.status === "ACTIVE" ? "İptal Et" : "Yeniden Aktifleştir"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
