import React, { useRef } from 'react';
import { format, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Event } from '@/models/events';
import { Download } from 'lucide-react';
import LogoImage from '@/assets/Logo_nuernbergspots.png';

interface EventImageGeneratorProps {
  events: Event[];
  categoryName: string;
}

interface GroupedEvent {
  date: Date;
  events: Event[];
}

export const EventImageGenerator: React.FC<EventImageGeneratorProps> = ({
  events,
  categoryName,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    // Deutscher Wochentag mit Punkt (Mo., Di., etc.)
    const dayStr = format(eventDate, 'EEEEEE', { locale: de }).replace(/^(.)(.?)$/, '$1$2.');
    const dateStr = format(eventDate, 'dd.MM.', { locale: de });
    const timeStr = format(eventDate, 'HH:mm', { locale: de });
    return {
      dayDate: `${dayStr} ${dateStr}`,
      time: timeStr ? `${timeStr} Uhr` : '',
      dayOnly: dayStr,
      dateOnly: dateStr
    };
  };

  const formatEventTitle = (event: Event) => {
    const firstSlot = event.dailyTimeSlots[0];
    const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
    
    if (firstSlot.date !== lastSlot.date) {
      const { dayOnly, dateOnly } = formatDate(lastSlot.date);
      return `${event.title} (bis ${dayOnly} ${dateOnly})`;
    }
    
    return event.title;
  };

  const formatAddress = (address: string) => {
    // Entferne PLZ (5 Ziffern) und optional folgendes Leerzeichen
    let formatted = address.replace(/\b\d{5}\s*/, '');
    
    // Entferne ", Deutschland" oder ",Deutschland" am Ende
    formatted = formatted.replace(/,\s*Deutschland$/i, '');
    
    // Entferne "Deutschland" am Ende
    formatted = formatted.replace(/\s*Deutschland$/i, '');
    
    return formatted.trim();
  };

  const groupEventsByDate = (events: Event[]): GroupedEvent[] => {
    const sortedEvents = [...events].sort((a, b) => {
      const aDate = new Date(a.dailyTimeSlots[0].date);
      const bDate = new Date(b.dailyTimeSlots[0].date);
      return aDate.getTime() - bDate.getTime();
    });

    const groupedEvents: { [key: string]: Event[] } = {};
    
    sortedEvents.forEach(event => {
      const firstSlot = event.dailyTimeSlots[0];
      const dateKey = format(new Date(firstSlot.date), 'yyyy-MM-dd');
      
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    return Object.entries(groupedEvents).map(([dateStr, events]) => ({
      date: new Date(dateStr),
      events
    }));
  };

  const handleDownload = async () => {
    if (elementRef.current) {
      try {
        const dataUrl = await toPng(elementRef.current, {
          quality: 1.0,
          backgroundColor: 'white',
        });
        const link = document.createElement('a');
        link.download = `${categoryName.toLowerCase()}-events.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Fehler beim Generieren des Bildes:', err);
      }
    }
  };

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="space-y-4">
      <div
        ref={elementRef}
        className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto relative"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div className="space-y-6">
          <div 
            className="absolute top-4 left-8 z-10"
            style={{
              transform: 'rotate(-2deg) translateY(-40%)',
            }}
          >
            <h1 
              className="text-4xl font-black tracking-tight inline-block"
              style={{ 
                color: 'black',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: `
                  -1px -1px 0 white,  
                  1px -1px 0 white,
                  -1px 1px 0 white,
                  1px 1px 0 white,
                  2px 2px 0 white,
                  -2px -2px 0 white,
                  2px -2px 0 white,
                  -2px 2px 0 white,
                  0 4px 8px rgba(0,0,0,0.1)
                `,
                border: '2px solid black'
              }}
            >
              {categoryName}
            </h1>
          </div>
          
          <div 
            className="space-y-4 rounded-lg overflow-hidden mt-12" 
            style={{
              backgroundColor: 'rgba(155, 27, 26, 1)',
              padding: '1.5rem',
              paddingBottom: '1rem'
            }}
          >
            {groupedEvents.map((group, groupIndex) => {
              const { dayDate } = formatDate(group.date.toISOString());
              return (
                <div key={groupIndex} className="space-y-2">
                  <div className="font-medium text-base text-white">
                    {dayDate}
                  </div>
                  <div className="space-y-1">
                    {group.events.map((event) => {
                      const time = event.dailyTimeSlots[0].from 
                        ? `${event.dailyTimeSlots[0].from} Uhr`
                        : '';
                      return (
                        <div key={event.id} className="ml-4">
                          {time && (
                            <span className="text-xs text-white/80 inline-block min-w-[70px]">
                              {time}
                            </span>
                          )}
                          <span className="text-sm text-white">
                            {formatEventTitle(event)}
                          </span>
                          {event.location.address && (
                            <div className="text-xs text-white/70 ml-[70px]">
                              {formatAddress(event.location.address)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        
          <div className="mt-4 flex justify-center items-center">
            <div 
              className="w-20 h-20 rounded-full bg-black flex items-center justify-center overflow-hidden"
            >
              <img 
                src={LogoImage} 
                alt="nuernbergspots.com" 
                className="w-18 h-18"
                style={{
                  opacity: 0.9
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Als Bild herunterladen
        </Button>
      </div>
    </div>
  );
}; 