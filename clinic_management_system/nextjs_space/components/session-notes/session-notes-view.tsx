
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { FileText, Plus, Edit, Loader2, Search, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface SessionNote {
  id: string;
  appointmentId: string;
  clientId: string;
  personnelId: string;
  content: string;
  isConfidential: boolean;
  includeInAI: boolean;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    date: string;
    time: string;
    service: {
      name: string;
    };
  };
  client?: {
    user: {
      name: string;
      email: string;
    };
  };
  personnel?: {
    user: {
      name: string;
      email: string;
    };
  };
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    name: string;
  };
}

interface Appointment {
  id: string;
  appointmentDate: string;
  status: string;
  service: {
    name: string;
  };
  client: {
    firstName: string;
    lastName: string;
  };
}

export function SessionNotesView() {
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    appointmentId: "",
    clientId: "",
    content: "",
    isConfidential: true,
    includeInAI: false,
  });

  useEffect(() => {
    fetchSessionNotes();
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchAppointments(selectedClient);
    }
  }, [selectedClient]);

  const fetchSessionNotes = async () => {
    try {
      const response = await fetch('/api/session-notes');
      if (response.ok) {
        const data = await response.json();
        setSessionNotes(data);
      }
    } catch (error) {
      console.error('Error fetching session notes:', error);
      toast.error('Seans notları yüklenemedi');
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

  const fetchAppointments = async (clientId: string) => {
    try {
      const response = await fetch(`/api/appointments?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        // Hem geçmiş hem gelecek randevuları getir (Psikolog gelecek seanslar için de not yazabilsin)
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!formData.appointmentId || !formData.clientId || !formData.content) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const response = await fetch('/api/session-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Seans notu kaydedildi');
        setIsDialogOpen(false);
        resetForm();
        fetchSessionNotes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Seans notu kaydedilemedi');
      }
    } catch (error) {
      console.error('Error creating session note:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    try {
      const response = await fetch('/api/session-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNote.id,
          content: formData.content,
          isConfidential: formData.isConfidential,
          includeInAI: formData.includeInAI,
        }),
      });

      if (response.ok) {
        toast.success('Seans notu güncellendi');
        setIsDialogOpen(false);
        setEditingNote(null);
        resetForm();
        fetchSessionNotes();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Seans notu güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating session note:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const openEditDialog = (note: SessionNote) => {
    setEditingNote(note);
    setFormData({
      appointmentId: note.appointmentId,
      clientId: note.clientId,
      content: note.content,
      isConfidential: note.isConfidential,
      includeInAI: note.includeInAI,
    });
    setSelectedClient(note.clientId);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      appointmentId: "",
      clientId: "",
      content: "",
      isConfidential: true,
      includeInAI: false,
    });
    setSelectedClient("");
    setSelectedAppointment("");
    setEditingNote(null);
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    setFormData({ ...formData, clientId, appointmentId: "" });
    setSelectedAppointment("");
  };

  const handleAppointmentChange = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setFormData({ ...formData, appointmentId });
  };

  const filteredNotes = sessionNotes.filter((note) => {
    const clientName = note.client?.user?.name?.toLowerCase() || "";
    const content = note.content.toLowerCase();
    const search = searchTerm.toLowerCase();
    return clientName.includes(search) || content.includes(search);
  });

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
          <div className="p-3 bg-teal-100 rounded-xl">
            <FileText className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Seans Notları</h2>
            <p className="text-gray-600">Danışan seanslarınızın notlarını yönetin</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Not
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Seans Notunu Düzenle' : 'Yeni Seans Notu'}
              </DialogTitle>
              <DialogDescription>
                {editingNote 
                  ? 'Seans notunu güncelleyin' 
                  : 'Randevuya ait seans notunu kaydedin'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!editingNote && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client">Danışan *</Label>
                    <Select value={selectedClient} onValueChange={handleClientChange}>
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

                  <div className="space-y-2">
                    <Label htmlFor="appointment">Randevu *</Label>
                    <Select 
                      value={selectedAppointment} 
                      onValueChange={handleAppointmentChange}
                      disabled={!selectedClient}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedClient ? "Randevu seçin" : "Önce danışan seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {appointments.map((apt) => {
                          const aptDate = new Date(apt.appointmentDate);
                          const isFuture = aptDate > new Date();
                          return (
                            <SelectItem key={apt.id} value={apt.id}>
                              {format(aptDate, 'd MMMM yyyy HH:mm', { locale: tr })} - {apt.service.name}
                              {isFuture && ' (Gelecek Seans)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Seans Notu *</Label>
                <Textarea
                  id="content"
                  placeholder="Seans sırasında gözlemlerinizi ve notlarınızı yazın..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="confidential">Gizli Not</Label>
                  <p className="text-sm text-gray-500">
                    Bu not sadece siz görebilirsiniz
                  </p>
                </div>
                <Switch
                  id="confidential"
                  checked={formData.isConfidential}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isConfidential: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="aiAnalysis">AI Analizine Dahil Et</Label>
                  <p className="text-sm text-gray-500">
                    Bu not AI analizlerinde kullanılabilir
                  </p>
                </div>
                <Switch
                  id="aiAnalysis"
                  checked={formData.includeInAI}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, includeInAI: checked })
                  }
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
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={editingNote ? handleUpdateNote : handleCreateNote}
                >
                  {editingNote ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Danışan adı veya not içeriğinde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Henüz seans notu yok</p>
              <p className="text-sm mt-2">İlk seans notunuzu eklemek için yukarıdaki butonu kullanın</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {note.client?.user?.name || 'Danışan'}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {note.appointment && format(new Date(note.appointment.date), 'd MMMM yyyy', { locale: tr })}
                        {' - '}
                        {note.appointment?.time}
                      </div>
                      <span>•</span>
                      <span>{note.appointment?.service?.name}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(note)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <div className="flex gap-2 mt-4">
                  {note.isConfidential && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Gizli
                    </span>
                  )}
                  {note.includeInAI && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      AI Analizinde
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-3">
                  Oluşturulma: {format(new Date(note.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                  {note.updatedAt !== note.createdAt && (
                    <> • Güncelleme: {format(new Date(note.updatedAt), 'd MMMM yyyy HH:mm', { locale: tr })}</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
