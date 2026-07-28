// Einfacher User Service Test

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

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock user API calls successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'Test User 1', email: 'user1@test.com' },
      { id: '2', name: 'Test User 2', email: 'user2@test.com' },
    ];

    mockApi.getData.mockResolvedValue(mockUsers);

    const result = await mockApi.getData('/users');

    expect(mockApi.getData).toHaveBeenCalledWith('/users');
    expect(result).toEqual(mockUsers);
  });

  it('should handle user creation', async () => {
    const newUser = { name: 'New User', email: 'new@test.com' };
    const response = { data: { id: '1', ...newUser } };

    mockApi.postData.mockResolvedValue({ id: '1', ...newUser });

    const result = await mockApi.postData('/users', newUser);

    expect(mockApi.postData).toHaveBeenCalledWith('/users', newUser);
    expect(result.name).toBe('New User');
  });

  it('should handle user updates', async () => {
    const updates = { name: 'Updated User' };
    const response = { data: { id: '1', ...updates } };

    mockApi.patchData.mockResolvedValue({ id: '1', ...updates });

    const result = await mockApi.patchData('/users/1', updates);

    expect(mockApi.patchData).toHaveBeenCalledWith('/users/1', updates);
    expect(result.name).toBe('Updated User');
  });

  it('should handle user deletion', async () => {
    mockApi.delete.mockResolvedValue({ status: 204 });

    const result = await mockApi.delete('/users/1');

    expect(mockApi.delete).toHaveBeenCalledWith('/users/1');
    expect(result.status).toBe(204);
  });

  it('should handle user API errors', async () => {
    const errorMessage = 'User not found';
    mockApi.getData.mockRejectedValue(new Error(errorMessage));

    await expect(mockApi.getData('/users/999')).rejects.toThrow(errorMessage);
  });
});
