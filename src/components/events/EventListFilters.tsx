import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarWeekSelect } from '@/components/ui/calendar-week-select';
import { EventCategory } from '@/models/event-category';
import { inputPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface EventListFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  approvalFilter: string;
  onApprovalFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  selectedWeek: string;
  onSelectedWeekChange: (value: string) => void;
  selectedMonth: string;
  onSelectedMonthChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  categories: EventCategory[];
  monthOptions: { key: string; label: string }[];
}

export function EventListFilters({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  approvalFilter,
  onApprovalFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  timeFilter,
  onTimeFilterChange,
  selectedWeek,
  onSelectedWeekChange,
  selectedMonth,
  onSelectedMonthChange,
  dateFilter,
  onDateFilterChange,
  categories,
  monthOptions,
}: EventListFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
      <div className="relative flex-1 mb-2 md:mb-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Nach Event-Namen suchen..."
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          className={cn(inputPreset, 'pl-10')}
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[200px] mb-2 md:mb-0')}>
          <SelectValue placeholder="Zeitraum-Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Zeiträume (Status)</SelectItem>
          <SelectItem value="past">Vergangene Events</SelectItem>
          <SelectItem value="running">Laufende Events</SelectItem>
          <SelectItem value="future">Zukünftige Events</SelectItem>
        </SelectContent>
      </Select>
      <Select value={approvalFilter} onValueChange={onApprovalFilterChange}>
        <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[200px] mb-2 md:mb-0')}>
          <SelectValue placeholder="Freigabe filtern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Freigaben</SelectItem>
          <SelectItem value="pending">Ausstehend</SelectItem>
          <SelectItem value="active">Freigegeben</SelectItem>
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[180px] mb-2 md:mb-0')}>
          <SelectValue placeholder="Kategorie filtern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="no-category">Ohne Kategorie</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[180px]')}>
          <SelectValue placeholder="Zeitraum filtern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Zeiträume</SelectItem>
          <SelectItem value="week">Kalenderwoche</SelectItem>
          <SelectItem value="month">Monat</SelectItem>
        </SelectContent>
      </Select>
      {timeFilter === 'week' && (
        <CalendarWeekSelect value={selectedWeek} onChange={onSelectedWeekChange} />
      )}
      {timeFilter === 'month' && (
        <Select value={selectedMonth} onValueChange={onSelectedMonthChange}>
          <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[220px]')}>
            <SelectValue placeholder="Monat auswählen" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(monthOption => (
              <SelectItem key={monthOption.key} value={monthOption.key}>
                {monthOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[180px]')}>
          <SelectValue placeholder="Datum filtern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Events</SelectItem>
          <SelectItem value="with-date">Mit Datum</SelectItem>
          <SelectItem value="no-date">Ohne Datum</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
