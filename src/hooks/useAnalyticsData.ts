import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useBusinessService } from '@/services/businessService';
import { useAnalyticsService } from '@/services/analyticsService';
import { DashboardAnalytics } from '@/models/business';
import { showUserFriendlyError } from '@/utils/errorUtils';

export function useAnalyticsData() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const businessService = useBusinessService();
  const analyticsService = useAnalyticsService();
  const isInitialMount = useRef(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const customerScans = await businessService.getCustomerScans();
      const result = analyticsService.calculateDashboardAnalytics(customerScans);
      setAnalytics(result);
    } catch (error) {
      console.error('Fehler beim Laden der Analytics:', error);
      showUserFriendlyError(error, toast, () => fetchAnalytics(), 'load-analytics');
    } finally {
      setIsLoading(false);
    }
  }, [businessService, analyticsService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchAnalytics();
    }
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    selectedBusiness,
    setSelectedBusiness,
    fetchAnalytics,
  };
}
