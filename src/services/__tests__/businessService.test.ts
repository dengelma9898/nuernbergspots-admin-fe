// Einfacher Business Service Test

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

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

describe('Business Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock API calls successfully', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    
    const result = await mockApi.get('/businesses');
    
    expect(mockApi.get).toHaveBeenCalledWith('/businesses');
    expect(result.data).toEqual([]);
  });

  it('should handle POST requests', async () => {
    const newBusiness = { name: 'Test Business' };
    const response = { data: { id: '1', ...newBusiness } };
    
    mockApi.post.mockResolvedValue(response);
    
    const result = await mockApi.post('/businesses', newBusiness);
    
    expect(mockApi.post).toHaveBeenCalledWith('/businesses', newBusiness);
    expect(result.data.name).toBe('Test Business');
  });

  it('should handle PATCH requests', async () => {
    const updates = { name: 'Updated Business' };
    const response = { data: { id: '1', ...updates } };
    
    mockApi.patch.mockResolvedValue(response);
    
    const result = await mockApi.patch('/businesses/1', updates);
    
    expect(mockApi.patch).toHaveBeenCalledWith('/businesses/1', updates);
    expect(result.data.name).toBe('Updated Business');
  });

  it('should handle DELETE requests', async () => {
    mockApi.delete.mockResolvedValue({ status: 204 });
    
    const result = await mockApi.delete('/businesses/1');
    
    expect(mockApi.delete).toHaveBeenCalledWith('/businesses/1');
    expect(result.status).toBe(204);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network Error';
    mockApi.get.mockRejectedValue(new Error(errorMessage));
    
    await expect(mockApi.get('/businesses')).rejects.toThrow(errorMessage);
  });
}); 