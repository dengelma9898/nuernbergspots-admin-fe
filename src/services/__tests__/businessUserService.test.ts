// Business User Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

// Mock Auth Context
const mockUser = {
  uid: 'admin-user-123',
  email: 'admin@example.com'
};

const mockAuth = {
  user: mockUser as any
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn((response) => response.data),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useMemo: jest.fn((fn) => fn()),
}));

import { useBusinessUserService } from '../businessUserService';

describe('Business User Service', () => {
  let businessUserService: ReturnType<typeof useBusinessUserService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.user = mockUser; // Reset user
    businessUserService = useBusinessUserService();
  });

  describe('getBusinessUsers', () => {
    it('should fetch all business users successfully', async () => {
      const mockBusinessUsers = [
        { 
          id: 'user1', 
          email: 'business1@example.com',
          businessIds: ['business1', 'business2'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          isDeleted: false,
          needsReview: false,
          eventIds: ['event1'],
          contactRequestIds: ['contact1']
        },
        { 
          id: 'user2', 
          email: 'business2@example.com',
          businessIds: ['business3'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          isDeleted: false,
          needsReview: true,
          eventIds: [],
          contactRequestIds: []
        },
      ];
      mockApi.get.mockResolvedValue({ data: mockBusinessUsers });

      const result = await businessUserService.getBusinessUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/users/admin-user-123/business-users');
      expect(result).toEqual(mockBusinessUsers);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(businessUserService.getBusinessUsers()).rejects.toThrow('Network error');
    });

    it('should throw error when no user is logged in', async () => {
      mockAuth.user = null;
      // Create new service instance with null user
      const noUserService = useBusinessUserService();

      await expect(noUserService.getBusinessUsers())
        .rejects.toThrow('Kein eingeloggter Benutzer gefunden');
    });

    it('should throw error when user has no uid', async () => {
      mockAuth.user = { email: 'test@example.com' } as any; // No uid
      // Create new service instance with user without uid
      const noUidService = useBusinessUserService();

      await expect(noUidService.getBusinessUsers())
        .rejects.toThrow('Kein eingeloggter Benutzer gefunden');
    });
  });

  describe('getBusinessUser', () => {
    it('should fetch a specific business user', async () => {
      const mockBusinessUser = { 
        id: 'user1', 
        email: 'business1@example.com',
        businessIds: ['business1', 'business2'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isDeleted: false,
        needsReview: false,
        eventIds: ['event1', 'event2'],
        contactRequestIds: ['contact1']
      };
      mockApi.get.mockResolvedValue({ data: mockBusinessUser });

      const result = await businessUserService.getBusinessUser('user1');

      expect(mockApi.get).toHaveBeenCalledWith('/users/user1/profile');
      expect(result).toEqual(mockBusinessUser);
    });

    it('should handle user not found', async () => {
      mockApi.get.mockRejectedValue(new Error('User not found'));

      await expect(businessUserService.getBusinessUser('nonexistent'))
        .rejects.toThrow('User not found');
    });

    it('should handle unauthorized access', async () => {
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(businessUserService.getBusinessUser('user1'))
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('addBusinessToUser', () => {
    it('should add a business to a user successfully', async () => {
      mockApi.post.mockResolvedValue(undefined);

      await businessUserService.addBusinessToUser('user1', 'business123');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/users/user1/business-user/businesses/business123',
        {}
      );
    });

    it('should handle add business errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Business assignment failed'));

      await expect(businessUserService.addBusinessToUser('user1', 'business123'))
        .rejects.toThrow('Business assignment failed');
    });

    it('should throw error when no user is logged in', async () => {
      mockAuth.user = null;
      // Create new service instance with null user
      const noUserService = useBusinessUserService();

      await expect(noUserService.addBusinessToUser('user1', 'business123'))
        .rejects.toThrow('Kein eingeloggter Benutzer gefunden');
    });

    it('should throw error when user has no uid', async () => {
      mockAuth.user = { email: 'test@example.com' } as any; // No uid
      // Create new service instance with user without uid
      const noUidService = useBusinessUserService();

      await expect(noUidService.addBusinessToUser('user1', 'business123'))
        .rejects.toThrow('Kein eingeloggter Benutzer gefunden');
    });

    it('should handle invalid business ID', async () => {
      mockApi.post.mockRejectedValue(new Error('Business not found'));

      await expect(businessUserService.addBusinessToUser('user1', 'invalid-business'))
        .rejects.toThrow('Business not found');
    });

    it('should handle invalid user ID', async () => {
      mockApi.post.mockRejectedValue(new Error('User not found'));

      await expect(businessUserService.addBusinessToUser('invalid-user', 'business123'))
        .rejects.toThrow('User not found');
    });
  });

  describe('edge cases', () => {
    it('should handle business users with empty arrays', async () => {
      const mockBusinessUser = { 
        id: 'user1', 
        email: 'minimal@example.com',
        businessIds: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isDeleted: false,
        needsReview: false,
        eventIds: [],
        contactRequestIds: []
      };
      mockApi.get.mockResolvedValue({ data: mockBusinessUser });

      const result = await businessUserService.getBusinessUser('user1');

      expect(result.businessIds).toEqual([]);
      expect(result.eventIds).toEqual([]);
      expect(result.contactRequestIds).toEqual([]);
    });

    it('should handle business users with many businesses', async () => {
      const manyBusinessIds = Array.from({ length: 50 }, (_, i) => `business${i}`);
      const mockBusinessUser = { 
        id: 'user1', 
        email: 'power-user@example.com',
        businessIds: manyBusinessIds,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isDeleted: false,
        needsReview: false
      };
      mockApi.get.mockResolvedValue({ data: mockBusinessUser });

      const result = await businessUserService.getBusinessUser('user1');

      expect(result.businessIds).toHaveLength(50);
    });

    it('should handle deleted business users', async () => {
      const mockBusinessUser = { 
        id: 'user1', 
        email: 'deleted@example.com',
        businessIds: ['business1'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isDeleted: true,
        needsReview: false
      };
      mockApi.get.mockResolvedValue({ data: mockBusinessUser });

      const result = await businessUserService.getBusinessUser('user1');

      expect(result.isDeleted).toBe(true);
    });

    it('should handle business users needing review', async () => {
      const mockBusinessUser = { 
        id: 'user1', 
        email: 'review@example.com',
        businessIds: ['business1'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isDeleted: false,
        needsReview: true
      };
      mockApi.get.mockResolvedValue({ data: mockBusinessUser });

      const result = await businessUserService.getBusinessUser('user1');

      expect(result.needsReview).toBe(true);
    });

    it('should handle unicode characters in email addresses', async () => {
      const mockBusinessUser = { 
        id: 'user1', 
        email: 'üser@exämple.com',
        businessIds: ['business1'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isDeleted: false,
        needsReview: false
      };
      mockApi.get.mockResolvedValue({ data: mockBusinessUser });

      const result = await businessUserService.getBusinessUser('user1');

      expect(result.email).toBe('üser@exämple.com');
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      mockApi.get.mockRejectedValue(new Error('Request timeout'));

      await expect(businessUserService.getBusinessUsers()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Internal server error'));

      await expect(businessUserService.addBusinessToUser('user1', 'business1'))
        .rejects.toThrow('Internal server error');
    });

    it('should handle forbidden access', async () => {
      mockApi.get.mockRejectedValue(new Error('Forbidden'));

      await expect(businessUserService.getBusinessUser('user1'))
        .rejects.toThrow('Forbidden');
    });

    it('should handle malformed responses', async () => {
      mockApi.get.mockResolvedValue({ data: null });

      const result = await businessUserService.getBusinessUsers();

      expect(result).toBeNull();
    });

    it('should handle empty response arrays', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await businessUserService.getBusinessUsers();

      expect(result).toEqual([]);
    });
  });

  describe('authentication dependency', () => {
    it('should work with different user IDs', async () => {
      const differentUser = { uid: 'different-admin-456', email: 'different@example.com' };
      mockAuth.user = differentUser;
      
      // Re-create service with new user
      businessUserService = useBusinessUserService();
      
      mockApi.get.mockResolvedValue({ data: [] });

      await businessUserService.getBusinessUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/users/different-admin-456/business-users');
    });

    it('should handle user changes during operation', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      await businessUserService.getBusinessUsers();

      // Change user
      mockAuth.user = { uid: 'new-user-789', email: 'new@example.com' };
      
      // Service should still use original user due to useMemo
      await businessUserService.getBusinessUsers();

      // Both calls should use the original user
      expect(mockApi.get).toHaveBeenCalledWith('/users/admin-user-123/business-users');
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });

    it('should handle missing user properties gracefully', async () => {
      mockAuth.user = { uid: 'user-123' } as any; // Missing email

      mockApi.get.mockResolvedValue({ data: [] });

      const result = await businessUserService.getBusinessUsers();

      expect(result).toEqual([]);
    });
  });

  describe('business assignment scenarios', () => {
    it('should handle adding multiple businesses sequentially', async () => {
      mockApi.post.mockResolvedValue(undefined);

      await businessUserService.addBusinessToUser('user1', 'business1');
      await businessUserService.addBusinessToUser('user1', 'business2');
      await businessUserService.addBusinessToUser('user1', 'business3');

      expect(mockApi.post).toHaveBeenCalledTimes(3);
      expect(mockApi.post).toHaveBeenNthCalledWith(1, '/users/user1/business-user/businesses/business1', {});
      expect(mockApi.post).toHaveBeenNthCalledWith(2, '/users/user1/business-user/businesses/business2', {});
      expect(mockApi.post).toHaveBeenNthCalledWith(3, '/users/user1/business-user/businesses/business3', {});
    });

    it('should handle duplicate business assignment', async () => {
      mockApi.post.mockRejectedValue(new Error('Business already assigned'));

      await expect(businessUserService.addBusinessToUser('user1', 'business1'))
        .rejects.toThrow('Business already assigned');
    });

    it('should handle business assignment with special characters in IDs', async () => {
      mockApi.post.mockResolvedValue(undefined);

      await businessUserService.addBusinessToUser('user-123_test', 'business-456_special');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/users/user-123_test/business-user/businesses/business-456_special',
        {}
      );
    });
  });
}); 