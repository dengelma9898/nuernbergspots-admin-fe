import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWeekSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CalendarWeekSelect: React.FC<CalendarWeekSelectProps> = ({ value, onChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return {
      start,
      end,
      weekNumber: format(date, 'w', { locale: de }),
      displayText: `${format(start, 'dd.MM.', { locale: de })} - ${format(end, 'dd.MM.yyyy', { locale: de })}`
    };
  };

  const currentWeek = getWeekRange(currentDate);

  const handlePreviousWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    const week = getWeekRange(newDate);
    onChange(week.weekNumber);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    const week = getWeekRange(newDate);
    onChange(week.weekNumber);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousWeek}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-sm font-medium">
        KW {currentWeek.weekNumber} ({currentWeek.displayText})
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}; 