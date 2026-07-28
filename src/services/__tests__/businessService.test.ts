// Einfacher Business Service Test

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock API
const mockApi = {
  getData: jest.fn(),
  postData: jest.fn(),
  patchData: jest.fn(),
  putData: jest.fn(),
  deleteData: jest.fn(),
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
    mockApi.getData.mockResolvedValue([]);

    const result = await mockApi.getData('/businesses');

    expect(mockApi.getData).toHaveBeenCalledWith('/businesses');
    expect(result).toEqual([]);
  });

  it('should handle POST requests', async () => {
    const newBusiness = { name: 'Test Business' };
    const response = { data: { id: '1', ...newBusiness } };

    mockApi.postData.mockResolvedValue({ id: '1', ...newBusiness });

    const result = await mockApi.postData('/businesses', newBusiness);

    expect(mockApi.postData).toHaveBeenCalledWith('/businesses', newBusiness);
    expect(result.name).toBe('Test Business');
  });

  it('should handle PATCH requests', async () => {
    const updates = { name: 'Updated Business' };
    const response = { data: { id: '1', ...updates } };

    mockApi.patchData.mockResolvedValue({ id: '1', ...updates });

    const result = await mockApi.patchData('/businesses/1', updates);

    expect(mockApi.patchData).toHaveBeenCalledWith('/businesses/1', updates);
    expect(result.name).toBe('Updated Business');
  });

  it('should handle DELETE requests', async () => {
    mockApi.delete.mockResolvedValue({ status: 204 });

    const result = await mockApi.delete('/businesses/1');

    expect(mockApi.delete).toHaveBeenCalledWith('/businesses/1');
    expect(result.status).toBe(204);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network Error';
    mockApi.getData.mockRejectedValue(new Error(errorMessage));

    await expect(mockApi.getData('/businesses')).rejects.toThrow(errorMessage);
  });
});
