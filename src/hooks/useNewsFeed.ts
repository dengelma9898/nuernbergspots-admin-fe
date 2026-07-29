import { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { NewsItem } from '@/models/news';
import { useNewsService } from '@/services/newsService';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { groupNewsByMonth } from '@/utils/newsManagementUtils';

export function useNewsFeed() {
  const newsService = useNewsService();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const sortedMonthGroups = useMemo(() => groupNewsByMonth(news), [news]);

  const fetchNews = async (scrollBehavior: ScrollBehavior = 'auto') => {
    setLoading(true);
    try {
      const allNews = await newsService.getAll();
      if (Array.isArray(allNews)) {
        setNews(
          allNews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        setTimeout(() => {
          feedRef.current?.scrollTo({
            top: feedRef.current.scrollHeight,
            behavior: scrollBehavior,
          });
        }, 100);
      } else {
        setNews([]);
      }
    } catch (e) {
      console.error('Fehler beim Laden der News:', e);
      showUserFriendlyError(e, toast, () => fetchNews(scrollBehavior), 'load-news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await newsService.delete(deletingItem.id);
      setDeletingItem(null);
      await fetchNews();
      toast.success('News erfolgreich gelöscht');
    } catch (e) {
      console.error('Fehler beim Löschen der News:', e);
      showUserFriendlyError(e, toast, () => handleDelete(), 'delete-news');
    } finally {
      setDeleting(false);
    }
  };

  return {
    news,
    loading,
    feedRef,
    sortedMonthGroups,
    fetchNews,
    deletingItem,
    setDeletingItem,
    deleting,
    handleDelete,
  };
}
