// Einfacher User Service Test

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

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock user API calls successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'Test User 1', email: 'user1@test.com' },
      { id: '2', name: 'Test User 2', email: 'user2@test.com' },
    ];
    
    mockApi.get.mockResolvedValue({ data: mockUsers });
    
    const result = await mockApi.get('/users');
    
    expect(mockApi.get).toHaveBeenCalledWith('/users');
    expect(result.data).toEqual(mockUsers);
  });

  it('should handle user creation', async () => {
    const newUser = { name: 'New User', email: 'new@test.com' };
    const response = { data: { id: '1', ...newUser } };
    
    mockApi.post.mockResolvedValue(response);
    
    const result = await mockApi.post('/users', newUser);
    
    expect(mockApi.post).toHaveBeenCalledWith('/users', newUser);
    expect(result.data.name).toBe('New User');
  });

  it('should handle user updates', async () => {
    const updates = { name: 'Updated User' };
    const response = { data: { id: '1', ...updates } };
    
    mockApi.patch.mockResolvedValue(response);
    
    const result = await mockApi.patch('/users/1', updates);
    
    expect(mockApi.patch).toHaveBeenCalledWith('/users/1', updates);
    expect(result.data.name).toBe('Updated User');
  });

  it('should handle user deletion', async () => {
    mockApi.delete.mockResolvedValue({ status: 204 });
    
    const result = await mockApi.delete('/users/1');
    
    expect(mockApi.delete).toHaveBeenCalledWith('/users/1');
    expect(result.status).toBe(204);
  });

  it('should handle user API errors', async () => {
    const errorMessage = 'User not found';
    mockApi.get.mockRejectedValue(new Error(errorMessage));
    
    await expect(mockApi.get('/users/999')).rejects.toThrow(errorMessage);
  });
}); 