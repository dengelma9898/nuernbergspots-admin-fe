import { useApi } from '@/lib/api';

interface AnonymousAccountStats {
  total: number;
  oldAccounts: number;
  cutoffDate?: string;
}

export const useAccountManagementService = () => {
  const api = useApi();
  const baseUrl = '/account-management';

  const cleanupAnonymousAccounts = async (): Promise<void> => {
    await api.deleteData<void>(`${baseUrl}/cleanup-anonymous`);
  };

  const getAnonymousAccountStats = async (): Promise<AnonymousAccountStats> => {
    return api.getData<AnonymousAccountStats>(`${baseUrl}/anonymous-stats`);
  };

  return {
    cleanupAnonymousAccounts,
    getAnonymousAccountStats,
  };
};
