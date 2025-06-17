// Contact Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

// Mock Auth Context
const mockAuth = {
  getUserId: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {},
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn((response) => response.data),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

import { useContactService } from '../contactService';

describe('Contact Service', () => {
  let contactService: ReturnType<typeof useContactService>;

  beforeEach(() => {
    jest.clearAllMocks();
    contactService = useContactService();
    mockAuth.getUserId.mockReturnValue('user123');
  });

  describe('getOpenContactRequestsCount', () => {
    it('should fetch open contact requests count', async () => {
      const mockCount = 5;
      mockApi.get.mockResolvedValue({ data: mockCount });

      const result = await contactService.getOpenContactRequestsCount();

      expect(mockApi.get).toHaveBeenCalledWith('/contact/open-requests/count');
      expect(result).toBe(mockCount);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(contactService.getOpenContactRequestsCount()).rejects.toThrow('Network error');
    });
  });

  describe('getContactRequests', () => {
    it('should fetch all contact requests successfully', async () => {
      const mockRequests = [
        { id: '1', subject: 'Request 1', message: 'Test message 1' },
        { id: '2', subject: 'Request 2', message: 'Test message 2' },
      ];
      mockApi.get.mockResolvedValue({ data: mockRequests });

      const result = await contactService.getContactRequests();

      expect(mockApi.get).toHaveBeenCalledWith('/contact');
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array on error', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      const result = await contactService.getContactRequests();

      expect(result).toEqual([]);
    });
  });

  describe('getContactRequestById', () => {
    it('should fetch a specific contact request', async () => {
      const mockRequest = { id: '1', subject: 'Test Request', message: 'Test message' };
      mockApi.get.mockResolvedValue({ data: mockRequest });

      const result = await contactService.getContactRequestById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/contact/user/user123/request/1');
      expect(result).toEqual(mockRequest);
    });

    it('should throw error when user is not authenticated', async () => {
      mockAuth.getUserId.mockReturnValue(null);

      await expect(contactService.getContactRequestById('1')).rejects.toThrow('Kein Benutzer angemeldet');
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Request not found'));

      await expect(contactService.getContactRequestById('1')).rejects.toThrow('Request not found');
    });
  });

  describe('respondToContactRequest', () => {
    it('should respond to a contact request successfully', async () => {
      const mockResponse = { id: '1', subject: 'Test', status: 'responded' };
      mockApi.patch.mockResolvedValue({ data: mockResponse });

      const result = await contactService.respondToContactRequest('1', 'Thank you for your message');

      expect(mockApi.patch).toHaveBeenCalledWith(
        '/contact/user/user123/request/1',
        { message: 'Thank you for your message' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when user is not authenticated', async () => {
      mockAuth.getUserId.mockReturnValue(null);

      await expect(contactService.respondToContactRequest('1', 'Response')).rejects.toThrow('Kein Benutzer angemeldet');
    });

    it('should handle API errors', async () => {
      mockApi.patch.mockRejectedValue(new Error('Failed to respond'));

      await expect(contactService.respondToContactRequest('1', 'Response')).rejects.toThrow('Failed to respond');
    });
  });

  describe('authentication edge cases', () => {
    it('should handle undefined user ID', async () => {
      mockAuth.getUserId.mockReturnValue(undefined);

      await expect(contactService.getContactRequestById('1')).rejects.toThrow('Kein Benutzer angemeldet');
      await expect(contactService.respondToContactRequest('1', 'test')).rejects.toThrow('Kein Benutzer angemeldet');
    });

    it('should handle empty string user ID', async () => {
      mockAuth.getUserId.mockReturnValue('');

      await expect(contactService.getContactRequestById('1')).rejects.toThrow('Kein Benutzer angemeldet');
      await expect(contactService.respondToContactRequest('1', 'test')).rejects.toThrow('Kein Benutzer angemeldet');
    });
  });
}); 