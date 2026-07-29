import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAdventCalendarManagement } from '@/hooks/useAdventCalendarManagement';

const mockNavigate = jest.fn();
const mockGetAll = jest.fn();
const mockGetFeatureStatus = jest.fn();
const mockSetFeatureStatus = jest.fn();
const mockDelete = jest.fn();
const mockGetUserProfile = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/services/adventCalendarService', () => ({
  useAdventCalendarService: () => ({
    getAll: mockGetAll,
    getFeatureStatus: mockGetFeatureStatus,
    setFeatureStatus: mockSetFeatureStatus,
    delete: mockDelete,
  }),
}));

jest.mock('@/services/userService', () => ({
  useUserService: () => ({
    getUserProfile: mockGetUserProfile,
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ getUserId: () => 'admin-1' }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useAdventCalendarManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue([
      {
        id: '1',
        number: 2,
        description: 'Zweiter Tag',
        createdAt: '2024-01-02T00:00:00.000Z',
        canParticipate: true,
        winners: [],
      },
      {
        id: '2',
        number: 1,
        description: 'Erster Tag',
        createdAt: '2024-01-01T00:00:00.000Z',
        canParticipate: false,
        winners: [],
      },
    ]);
    mockGetFeatureStatus.mockResolvedValue({ isFeatureActive: true });
    mockGetUserProfile.mockResolvedValue({ userType: 'ADMIN' });
    global.confirm = jest.fn(() => true);
  });

  it('loads and sorts entries by number', async () => {
    const { result } = renderHook(() => useAdventCalendarManagement(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetAll).toHaveBeenCalled();
    expect(result.current.filteredEntries[0].number).toBe(1);
    expect(result.current.filteredEntries[1].number).toBe(2);
  });

  it('filters entries by search query', async () => {
    const { result } = renderHook(() => useAdventCalendarManagement(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearchQuery('Zweiter');
    });

    expect(result.current.filteredEntries).toHaveLength(1);
    expect(result.current.filteredEntries[0].description).toBe('Zweiter Tag');
  });

  it('deletes entry after confirmation', async () => {
    mockDelete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAdventCalendarManagement(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleDelete('1');
    });

    expect(mockDelete).toHaveBeenCalledWith('1');
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });

  it('toggles feature status', async () => {
    mockSetFeatureStatus.mockResolvedValue({ isFeatureActive: false });
    const { result } = renderHook(() => useAdventCalendarManagement(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingFeatureStatus).toBe(false));

    await act(async () => {
      await result.current.handleFeatureStatusToggle(false);
    });

    expect(mockSetFeatureStatus).toHaveBeenCalledWith(false);
    expect(result.current.featureStatus).toBe(false);
  });
});
