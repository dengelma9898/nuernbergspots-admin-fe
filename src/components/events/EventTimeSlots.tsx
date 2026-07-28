import React from 'react';
import { Event, DailyTimeSlot } from '@/models/events';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/LoadingButton';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { formatDate, formatMonthYear } from '@/utils/eventFormatters';
import { Calendar, Trash2, Plus, Info, CalendarDays } from 'lucide-react';
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
  const monthYear = isEditing ? editedEvent.monthYear : event.monthYear;

  return (
    <div className="space-y-4">
      {/* Zeitfenster (dailyTimeSlots) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-foreground">Zeitfenster</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Beide Felder (Zeitfenster und Monat/Jahr) können gleichzeitig gesetzt sein. Bei
                  der Anzeige hat &apos;Zeitfenster&apos; Priorität vor &apos;Monat/Jahr&apos;.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
                          className={cn(inputPreset)}
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
                          className={cn(inputPreset)}
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
                          className={cn(inputPreset)}
                        />
                      </div>
                    </div>
                    <LoadingButton
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
                    </LoadingButton>
                  </div>
                ))}
              </div>
            )}
            <LoadingButton
              variant="outline"
              size="sm"
              onClick={() => {
                const newSlots = [
                  ...(editedEvent.dailyTimeSlots || []),
                  { date: '', from: '', to: '' },
                ];
                onInputChange('dailyTimeSlots', newSlots);
              }}
              className={cn(buttonPreset)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Zeitfenster hinzufügen
            </LoadingButton>
          </div>
        ) : (
          <div className="space-y-2">
            {slots && slots.length > 0 ? (
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
            ) : (
              <p className="text-sm text-muted-foreground">Keine Zeitfenster definiert</p>
            )}
          </div>
        )}
      </div>

      {/* Monat/Jahr (monthYear) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-foreground">Monat/Jahr (optional)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Du kannst zuerst Monat/Jahr setzen und später Zeitfenster hinzufügen, ohne
                  Monat/Jahr löschen zu müssen. Beide Felder können gleichzeitig existieren.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isEditing ? (
          <div className="flex gap-2 items-end">
            <MonthYearPicker
              value={editedEvent.monthYear}
              onChange={value => onInputChange('monthYear', value || undefined)}
              className={cn(inputPreset, 'flex-1')}
            />
            {editedEvent.monthYear && (
              <LoadingButton
                variant="destructive"
                size="sm"
                onClick={() => onInputChange('monthYear', undefined)}
                title="Monat/Jahr entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </LoadingButton>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {monthYear ? (
              <>
                <CalendarDays className="h-4 w-4" />
                <span>{formatMonthYear(monthYear)}</span>
              </>
            ) : (
              <p>Kein Monat/Jahr angegeben</p>
            )}
          </div>
        )}
      </div>

      {/* Hinweis wenn keine Zeiteinordnung vorhanden */}
      {!isEditing && (!slots || slots.length === 0) && !monthYear && (
        <div className="text-sm text-muted-foreground italic">Keine Zeiteinordnung vorhanden</div>
      )}
    </div>
  );
};
