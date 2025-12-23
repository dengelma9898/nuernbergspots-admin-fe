import React from 'react';
import { Event, DailyTimeSlot } from '@/models/events';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedButton } from '@/components/AnimatedButton';
import { glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/eventFormatters';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface EventTimeSlotsProps {
  event: Event;
  isEditing: boolean;
  editedEvent: Partial<Event>;
  onInputChange: (field: keyof Event, value: any) => void;
}

export const EventTimeSlots: React.FC<EventTimeSlotsProps> = ({
  event,
  isEditing,
  editedEvent,
  onInputChange,
}) => {
  const slots = isEditing ? editedEvent.dailyTimeSlots : event.dailyTimeSlots;

  return (
    <div className="space-y-2">
      <Label className="text-foreground">Zeitfenster</Label>
      {isEditing ? (
        <div className="space-y-4">
          {slots && slots.length > 0 && (
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <div>
                      <Label className="text-muted-foreground">Datum</Label>
                      <Input
                        type="date"
                        value={slot.date}
                        onChange={e => {
                          const newSlots = [...(editedEvent.dailyTimeSlots || [])];
                          newSlots[index] = { ...slot, date: e.target.value };
                          onInputChange('dailyTimeSlots', newSlots);
                        }}
                        className={cn(glassInput)}
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Von</Label>
                      <Input
                        type="time"
                        value={slot.from || ''}
                        onChange={e => {
                          const newSlots = [...(editedEvent.dailyTimeSlots || [])];
                          newSlots[index] = { ...slot, from: e.target.value };
                          onInputChange('dailyTimeSlots', newSlots);
                        }}
                        className={cn(glassInput)}
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Bis</Label>
                      <Input
                        type="time"
                        value={slot.to || ''}
                        onChange={e => {
                          const newSlots = [...(editedEvent.dailyTimeSlots || [])];
                          newSlots[index] = { ...slot, to: e.target.value };
                          onInputChange('dailyTimeSlots', newSlots);
                        }}
                        className={cn(glassInput)}
                      />
                    </div>
                  </div>
                  <AnimatedButton
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newSlots = (editedEvent.dailyTimeSlots || []).filter(
                        (_, i) => i !== index
                      );
                      if (newSlots.length === 0) {
                        toast.warning('Letztes Zeitfenster entfernt', {
                          description:
                            'Das Event hat jetzt keine Zeitfenster mehr. Du kannst später neue hinzufügen.',
                        });
                      }
                      onInputChange('dailyTimeSlots', newSlots);
                    }}
                    className="mb-0"
                    title="Zeitfenster löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AnimatedButton>
                </div>
              ))}
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSlots = [
                    ...(editedEvent.dailyTimeSlots || []),
                    { date: '', from: '', to: '' },
                  ];
                  onInputChange('dailyTimeSlots', newSlots);
                }}
                className={cn(glassButton)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Zeitfenster hinzufügen
              </AnimatedButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {slots && slots.length > 0 && (
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(slot.date)}</span>
                  {slot.from && slot.to && (
                    <span className="ml-2">
                      {slot.from} - {slot.to}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

