import { ApiResponse, unwrapData } from '@/lib/apiUtils';
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
    await api.delete<ApiResponse<void>>(`${baseUrl}/cleanup-anonymous`);
  };

  const getAnonymousAccountStats = async (): Promise<AnonymousAccountStats> => {
    const response = await api.get<ApiResponse<AnonymousAccountStats>>(`${baseUrl}/anonymous-stats`);
    return unwrapData(response);
  };

  return {
    cleanupAnonymousAccounts,
    getAnonymousAccountStats
  };
}; 