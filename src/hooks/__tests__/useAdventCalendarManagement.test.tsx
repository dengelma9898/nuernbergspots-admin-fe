import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAdventCalendarManagement } from '@/hooks/useAdventCalendarManagement';

const mockNavigate = vi.fn();
const mockGetAll = vi.fn();
const mockGetFeatureStatus = vi.fn();
const mockSetFeatureStatus = vi.fn();
const mockDelete = vi.fn();
const mockGetUserProfile = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/adventCalendarService', async () => ({
  useAdventCalendarService: () => ({
    getAll: mockGetAll,
    getFeatureStatus: mockGetFeatureStatus,
    setFeatureStatus: mockSetFeatureStatus,
    delete: mockDelete,
  }),
}));

vi.mock('@/services/userService', async () => ({
  useUserService: () => ({
    getUserProfile: mockGetUserProfile,
  }),
}));

vi.mock('@/contexts/AuthContext', async () => ({
  useAuth: () => ({ getUserId: () => 'admin-1' }),
}));

vi.mock('sonner', async () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useAdventCalendarManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    global.confirm = vi.fn(() => true);
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
