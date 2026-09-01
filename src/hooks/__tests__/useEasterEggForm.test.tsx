import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useEasterEggForm } from '@/hooks/useEasterEggForm';

const mockNavigate = vi.fn();
const mockCreate = vi.fn();
const mockGetById = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/easterEggService', async () => ({
  useEasterEggService: () => ({
    create: mockCreate,
    update: vi.fn(),
    getById: mockGetById,
    uploadImage: vi.fn(),
  }),
}));

vi.mock('@/hooks/useValidatedImageUpload', async () => ({
  useValidatedImageUpload: () => ({
    files: [],
    previewUrls: [],
    error: null,
    handleFileChange: vi.fn(),
    clearImages: vi.fn(),
  }),
}));

vi.mock('sonner', async () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const createWrapper = (path: string) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/easter-egg-hunt/new" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );
  };

describe('useEasterEggForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'egg-1' });
  });

  it('validates required fields on submit', async () => {
    const { result } = renderHook(() => useEasterEggForm(), {
      wrapper: createWrapper('/easter-egg-hunt/new'),
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.validationErrors.length).toBeGreaterThan(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates egg when form is valid', async () => {
    const { result } = renderHook(() => useEasterEggForm(), {
      wrapper: createWrapper('/easter-egg-hunt/new'),
    });

    act(() => {
      result.current.setFormData({
        title: 'Test Egg',
        description: 'Hidden in the park',
        prizeDescription: 'Gift card',
        numberOfWinners: 1,
        startDate: '2024-04-01',
        endDate: '2024-04-30',
      });
      result.current.setLocationData({
        address: 'Nürnberg',
        latitude: 49.45,
        longitude: 11.07,
      });
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/easter-egg-hunt');
  });
});
