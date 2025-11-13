

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, Calendar, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Reminder {
  appointmentId: string;
  clientName: string;
  personnelName: string;
  appointmentDate: string;
  isOnline: boolean;
  phone: string;
  whatsappLink: string;
}

interface DailyNotification {
  personnelId: string;
  personnelName: string;
  phone: string;
  appointmentCount: number;
  appointments: Array<{
    clientName: string;
    time: string;
    isOnline: boolean;
  }>;
  whatsappLink: string;
}

export function AppointmentNotifications() {
  const { data: session } = useSession() || {};
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dailyNotifications, setDailyNotifications] = useState<DailyNotification[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const userRole = session?.user?.role;

  // Sadece admin ve koordinatör görebilir
  if (!["ADMINISTRATOR", "COORDINATOR"].includes(userRole || "")) {
    return null;
  }

  const loadReminders = async () => {
    setIsLoadingReminders(true);
    try {
      const response = await fetch("/api/appointments/reminders");
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      } else {
        toast.error("Hatırlatmalar yüklenemedi");
      }
    } catch (error) {
      console.error("Load reminders error:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoadingReminders(false);
    }
  };

  const loadDailyNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await fetch("/api/appointments/daily-notifications");
      if (response.ok) {
        const data = await response.json();
        setDailyNotifications(data);
      } else {
        toast.error("Günlük bildirimler yüklenemedi");
      }
    } catch (error) {
      console.error("Load daily notifications error:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadReminders();
    loadDailyNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Hatırlatmalar (24 saat önceden) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-600" />
                Randevu Hatırlatmaları
              </CardTitle>
              <CardDescription>
                24 saat sonrasına kadar olan randevular için danışanlara hatırlatma gönderin
              </CardDescription>
            </div>
            <Button
              onClick={loadReminders}
              variant="outline"
              size="sm"
              disabled={isLoadingReminders}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingReminders ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              24 saat içinde randevusu olan danışan bulunmamaktadır
            </p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.appointmentId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{reminder.clientName}</p>
                      <Badge variant={reminder.isOnline ? "default" : "secondary"}>
                        {reminder.isOnline ? "Online" : "Yüz Yüze"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <Calendar className="inline h-3.5 w-3.5 mr-1" />
                      {formatDate(reminder.appointmentDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Psikolog: {reminder.personnelName}
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(reminder.whatsappLink, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Gönder
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Günlük Bildirimler (Psikologlara) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Günlük Randevu Bildirimleri
              </CardTitle>
              <CardDescription>
                Psikologlara bugünkü randevuları bildirin
              </CardDescription>
            </div>
            <Button
              onClick={loadDailyNotifications}
              variant="outline"
              size="sm"
              disabled={isLoadingNotifications}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dailyNotifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Bugün randevusu olan psikolog bulunmamaktadır
            </p>
          ) : (
            <div className="space-y-3">
              {dailyNotifications.map((notification) => (
                <div
                  key={notification.personnelId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{notification.personnelName}</p>
                      <Badge variant="outline">
                        {notification.appointmentCount} Randevu
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                      {notification.appointments.map((apt, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          <Clock className="inline h-3.5 w-3.5 mr-1" />
                          {apt.time} - {apt.clientName} 
                          <Badge 
                            variant={apt.isOnline ? "default" : "secondary"}
                            className="ml-2 text-xs"
                          >
                            {apt.isOnline ? "Online" : "Yüz Yüze"}
                          </Badge>
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(notification.whatsappLink, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Gönder
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
