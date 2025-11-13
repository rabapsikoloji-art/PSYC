
"use client";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import { toast } from 'sonner';

interface FullCalendarWrapperProps {
  events: any[];
  onEventClick: (info: any) => void;
  onEventDrop?: (info: any) => void;
  onEventResize?: (info: any) => void;
  onDateClick?: (info: any) => void;
  userRole: string;
}

export default function FullCalendarWrapper({ 
  events, 
  onEventClick, 
  onEventDrop,
  onEventResize,
  onDateClick,
  userRole 
}: FullCalendarWrapperProps) {
  
  // Yönetici ve koordinatör düzenleme yapabilir
  const canEdit = ['ADMINISTRATOR', 'COORDINATOR', 'PSYCHOLOGIST'].includes(userRole);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      locale={trLocale}
      events={events}
      eventClick={onEventClick}
      eventDrop={onEventDrop}
      eventResize={onEventResize}
      dateClick={canEdit ? onDateClick : undefined}
      selectable={canEdit}
      editable={canEdit}
      droppable={canEdit}
      eventResizableFromStart={canEdit}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      height="auto"
      aspectRatio={1.8}
      eventDisplay="block"
      dayMaxEvents={3}
      moreLinkClick="popover"
      businessHours={{
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        startTime: '08:00',
        endTime: '18:00',
      }}
      slotMinTime="00:00:00"
      slotMaxTime="24:00:00"
      slotDuration="00:30:00"
      expandRows={true}
      nowIndicator={true}
      eventMouseEnter={(info: any) => {
        if (canEdit) {
          info.el.style.cursor = 'pointer';
          info.el.title = 'Tıklayarak düzenle veya sürükleyerek taşı';
        }
      }}
      eventDidMount={(info: any) => {
        info.el.style.border = `2px solid ${info.event.borderColor}`;
        info.el.style.borderRadius = '6px';
        info.el.style.fontSize = '12px';
        info.el.style.fontWeight = '500';
      }}
      dayCellDidMount={(info: any) => {
        const today = new Date();
        const cellDate = new Date(info.date);
        
        if (cellDate.toDateString() === today.toDateString()) {
          info.el.style.backgroundColor = '#fef3f2';
          info.el.style.borderColor = '#f87171';
        }
      }}
      eventDragStart={(info: any) => {
        if (canEdit) {
          toast.info('Randevuyu taşıyorsunuz...');
        }
      }}
      eventResizeStart={(info: any) => {
        if (canEdit) {
          toast.info('Randevu süresini değiştiriyorsunuz...');
        }
      }}
    />
  );
}
