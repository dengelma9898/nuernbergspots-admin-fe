// Account Management Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn((response) => response.data),
}));

import { useAccountManagementService } from '../accountManagementService';

describe('Account Management Service', () => {
  let accountManagementService: ReturnType<typeof useAccountManagementService>;

  beforeEach(() => {
    jest.clearAllMocks();
    accountManagementService = useAccountManagementService();
  });

  describe('cleanupAnonymousAccounts', () => {
    it('should cleanup anonymous accounts successfully', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await accountManagementService.cleanupAnonymousAccounts();

      expect(mockApi.delete).toHaveBeenCalledWith('/account-management/cleanup-anonymous');
    });

    it('should handle cleanup errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Cleanup failed'));

      await expect(accountManagementService.cleanupAnonymousAccounts())
        .rejects.toThrow('Cleanup failed');
    });

    it('should handle server errors during cleanup', async () => {
      mockApi.delete.mockRejectedValue(new Error('Internal server error'));

      await expect(accountManagementService.cleanupAnonymousAccounts())
        .rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.delete.mockRejectedValue(new Error('Unauthorized'));

      await expect(accountManagementService.cleanupAnonymousAccounts())
        .rejects.toThrow('Unauthorized');
    });

    it('should handle network timeouts', async () => {
      mockApi.delete.mockRejectedValue(new Error('Request timeout'));

      await expect(accountManagementService.cleanupAnonymousAccounts())
        .rejects.toThrow('Request timeout');
    });
  });

  describe('getAnonymousAccountStats', () => {
    it('should fetch anonymous account stats successfully', async () => {
      const mockStats = {
        total: 150,
        oldAccounts: 45,
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(mockApi.get).toHaveBeenCalledWith('/account-management/anonymous-stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle stats with zero accounts', async () => {
      const mockStats = {
        total: 0,
        oldAccounts: 0,
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result).toEqual(mockStats);
      expect(result.total).toBe(0);
      expect(result.oldAccounts).toBe(0);
    });

    it('should handle stats without cutoff date', async () => {
      const mockStats = {
        total: 100,
        oldAccounts: 25
        // No cutoffDate
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result).toEqual(mockStats);
      expect(result.cutoffDate).toBeUndefined();
    });

    it('should handle large numbers of accounts', async () => {
      const mockStats = {
        total: 1000000,
        oldAccounts: 750000,
        cutoffDate: '2023-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.total).toBe(1000000);
      expect(result.oldAccounts).toBe(750000);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(accountManagementService.getAnonymousAccountStats())
        .rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Internal server error'));

      await expect(accountManagementService.getAnonymousAccountStats())
        .rejects.toThrow('Internal server error');
    });

    it('should handle unauthorized access', async () => {
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(accountManagementService.getAnonymousAccountStats())
        .rejects.toThrow('Unauthorized');
    });

    it('should handle malformed response data', async () => {
      mockApi.get.mockResolvedValue({ data: null });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result).toBeNull();
    });

    it('should handle empty response data', async () => {
      mockApi.get.mockResolvedValue({ data: {} });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle stats where old accounts exceed total', async () => {
      // This shouldn't happen in real scenarios but we should handle it gracefully
      const mockStats = {
        total: 50,
        oldAccounts: 75, // More old accounts than total
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.total).toBe(50);
      expect(result.oldAccounts).toBe(75);
    });

    it('should handle negative numbers gracefully', async () => {
      const mockStats = {
        total: -10,
        oldAccounts: -5,
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.total).toBe(-10);
      expect(result.oldAccounts).toBe(-5);
    });

    it('should handle different date formats', async () => {
      const mockStats = {
        total: 100,
        oldAccounts: 30,
        cutoffDate: '2024-12-31'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.cutoffDate).toBe('2024-12-31');
    });

    it('should handle very old cutoff dates', async () => {
      const mockStats = {
        total: 500,
        oldAccounts: 450,
        cutoffDate: '2020-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.cutoffDate).toBe('2020-01-01T00:00:00Z');
    });

    it('should handle future cutoff dates', async () => {
      const mockStats = {
        total: 10,
        oldAccounts: 0,
        cutoffDate: '2025-12-31T23:59:59Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.cutoffDate).toBe('2025-12-31T23:59:59Z');
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts for stats', async () => {
      mockApi.get.mockRejectedValue(new Error('Request timeout'));

      await expect(accountManagementService.getAnonymousAccountStats())
        .rejects.toThrow('Request timeout');
    });

    it('should handle forbidden access for cleanup', async () => {
      mockApi.delete.mockRejectedValue(new Error('Forbidden'));

      await expect(accountManagementService.cleanupAnonymousAccounts())
        .rejects.toThrow('Forbidden');
    });

    it('should handle service unavailable errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Service unavailable'));

      await expect(accountManagementService.getAnonymousAccountStats())
        .rejects.toThrow('Service unavailable');
    });

    it('should handle rate limiting errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Too many requests'));

      await expect(accountManagementService.cleanupAnonymousAccounts())
        .rejects.toThrow('Too many requests');
    });

    it('should handle database connection errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Database connection failed'));

      await expect(accountManagementService.getAnonymousAccountStats())
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle getting stats before cleanup', async () => {
      const initialStats = {
        total: 200,
        oldAccounts: 80,
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: initialStats });

      const statsBefore = await accountManagementService.getAnonymousAccountStats();

      expect(statsBefore.total).toBe(200);
      expect(statsBefore.oldAccounts).toBe(80);
    });

    it('should handle getting stats after cleanup', async () => {
      // First cleanup
      mockApi.delete.mockResolvedValue(undefined);
      await accountManagementService.cleanupAnonymousAccounts();

      // Then get updated stats
      const updatedStats = {
        total: 120,
        oldAccounts: 0,
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: updatedStats });

      const statsAfter = await accountManagementService.getAnonymousAccountStats();

      expect(statsAfter.total).toBe(120);
      expect(statsAfter.oldAccounts).toBe(0);
    });

    it('should handle multiple cleanup operations', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await accountManagementService.cleanupAnonymousAccounts();
      await accountManagementService.cleanupAnonymousAccounts();
      await accountManagementService.cleanupAnonymousAccounts();

      expect(mockApi.delete).toHaveBeenCalledTimes(3);
      expect(mockApi.delete).toHaveBeenCalledWith('/account-management/cleanup-anonymous');
    });

    it('should handle concurrent operations', async () => {
      mockApi.get.mockResolvedValue({ data: { total: 100, oldAccounts: 50 } });
      mockApi.delete.mockResolvedValue(undefined);

      // Simulate concurrent operations
      const promises = [
        accountManagementService.getAnonymousAccountStats(),
        accountManagementService.cleanupAnonymousAccounts(),
        accountManagementService.getAnonymousAccountStats()
      ];

      await Promise.all(promises);

      expect(mockApi.get).toHaveBeenCalledTimes(2);
      expect(mockApi.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('data validation', () => {
    it('should handle stats with string numbers', async () => {
      const mockStats = {
        total: '150',
        oldAccounts: '45',
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result.total).toBe('150');
      expect(result.oldAccounts).toBe('45');
    });

    it('should handle stats with additional properties', async () => {
      const mockStats = {
        total: 100,
        oldAccounts: 25,
        cutoffDate: '2024-01-01T00:00:00Z',
        extraProperty: 'should be preserved',
        anotherExtra: 42
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result).toEqual(mockStats);
      expect((result as any).extraProperty).toBe('should be preserved');
      expect((result as any).anotherExtra).toBe(42);
    });

    it('should handle stats with missing required properties', async () => {
      const mockStats = {
        // Missing total and oldAccounts
        cutoffDate: '2024-01-01T00:00:00Z'
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await accountManagementService.getAnonymousAccountStats();

      expect(result).toEqual(mockStats);
      expect((result as any).total).toBeUndefined();
      expect((result as any).oldAccounts).toBeUndefined();
    });
  });
}); 