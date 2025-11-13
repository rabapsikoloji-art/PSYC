
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Download } from "lucide-react";
import FullCalendarWrapper from "./full-calendar-wrapper";
import { AppointmentDialog } from "./appointment-dialog";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";

interface CalendarViewProps {
  userRole: string;
}

export function CalendarView({ userRole }: CalendarViewProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    // Randevuya tıklandığında düzenleme modalını aç
    const appointment = appointments.find(apt => apt.id === info.event.id);
    if (appointment && ['ADMINISTRATOR', 'COORDINATOR', 'PSYCHOLOGIST'].includes(userRole)) {
      setSelectedAppointment(appointment);
      setDialogOpen(true);
    }
  };

  const handleDateClick = (info: any) => {
    // Boş hücreye tıklandığında yeni randevu oluşturma modalını aç
    if (['ADMINISTRATOR', 'COORDINATOR', 'PSYCHOLOGIST'].includes(userRole)) {
      setSelectedAppointment({
        appointmentDate: info.dateStr,
        appointmentTime: info.dateStr
      });
      setDialogOpen(true);
    }
  };

  const handleEventDrop = async (info: any) => {
    try {
      const newDate = info.event.start;
      const appointmentId = info.event.id;
      
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: newDate.toISOString()
        })
      });

      if (response.ok) {
        toast.success('Randevu başarıyla taşındı!');
        fetchAppointments();
      } else {
        info.revert();
        toast.error('Randevu taşınamadı!');
      }
    } catch (error) {
      info.revert();
      toast.error('Bir hata oluştu!');
    }
  };

  const handleEventResize = async (info: any) => {
    try {
      const newDate = info.event.start;
      const newDuration = Math.round((info.event.end - info.event.start) / (1000 * 60));
      const appointmentId = info.event.id;
      
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: newDate.toISOString(),
          duration: newDuration
        })
      });

      if (response.ok) {
        toast.success('Randevu süresi güncellendi!');
        fetchAppointments();
      } else {
        info.revert();
        toast.error('Randevu güncellenemedi!');
      }
    } catch (error) {
      info.revert();
      toast.error('Bir hata oluştu!');
    }
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleExport = () => {
    const exportData = appointments.map(apt => ({
      Tarih: new Date(apt.appointmentDate).toLocaleDateString('tr-TR'),
      Saat: new Date(apt.appointmentDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      Danışan: `${apt.client.firstName} ${apt.client.lastName}`,
      Psikolog: `${apt.personnel.firstName} ${apt.personnel.lastName}`,
      Hizmet: apt.service.name,
      Süre: `${apt.duration} dk`,
      Durum: apt.status,
      Ücret: apt.price ? `${apt.price} ₺` : '-'
    }));
    
    exportToCSV(exportData, "randevular");
  };

  const events = appointments.map(apt => {
    const start = new Date(apt.appointmentDate);
    const end = new Date(start.getTime() + apt.duration * 60000);

    return {
      id: apt.id,
      title: `${apt.client.firstName} ${apt.client.lastName}`,
      start,
      end,
      backgroundColor: apt.status === 'COMPLETED' ? '#10b981' : 
                       apt.status === 'CANCELLED' ? '#ef4444' :
                       apt.isOnline ? '#3b82f6' : '#14b8a6',
      borderColor: apt.status === 'COMPLETED' ? '#059669' : 
                   apt.status === 'CANCELLED' ? '#dc2626' :
                   apt.isOnline ? '#2563eb' : '#0d9488',
      extendedProps: { appointment: apt }
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-xl">
            <CalendarIcon className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Randevu Takvimi
            </h2>
            <p className="text-gray-600">
              {appointments.length} randevu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={appointments.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
          {['ADMINISTRATOR', 'COORDINATOR', 'PSYCHOLOGIST'].includes(userRole) && (
            <Button 
              size="sm" 
              onClick={handleNewAppointment}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Randevu
            </Button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-teal-600"></div>
          <span className="text-sm text-gray-600">Yüz Yüze</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-600"></div>
          <span className="text-sm text-gray-600">Tamamlandı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600"></div>
          <span className="text-sm text-gray-600">İptal</span>
        </div>
        {['ADMINISTRATOR', 'COORDINATOR', 'PSYCHOLOGIST'].includes(userRole) && (
          <div className="ml-auto text-sm text-gray-500 italic">
            💡 İpucu: Randevuları sürükleyerek taşıyabilir, kenarlardan boyutlandırabilirsiniz
          </div>
        )}
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <FullCalendarWrapper 
            events={events} 
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onDateClick={handleDateClick}
            userRole={userRole}
          />
        </CardContent>
      </Card>

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        userRole={userRole}
        appointment={selectedAppointment}
      />
    </div>
  );
}
