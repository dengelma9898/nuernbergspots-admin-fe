import { format, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { NewsItem } from '@/models/news';

export interface NewsMonthGroup {
  label: string;
  date: Date;
  items: NewsItem[];
}

export function groupNewsByMonth(news: NewsItem[]): NewsMonthGroup[] {
  const grouped = news.reduce(
    (acc, item) => {
      const createdAt = new Date(item.createdAt);
      const monthKey = format(startOfMonth(createdAt), 'yyyy-MM', { locale: de });
      const monthLabel = format(startOfMonth(createdAt), 'MMMM yyyy', { locale: de });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          label: monthLabel,
          date: createdAt,
          items: [],
        };
      }

      acc[monthKey].items.push(item);
      return acc;
    },
    {} as Record<string, NewsMonthGroup>
  );

  return Object.values(grouped).sort((a, b) => b.date.getTime() - a.date.getTime());
}
