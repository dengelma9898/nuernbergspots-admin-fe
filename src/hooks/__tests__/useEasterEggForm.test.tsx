import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useEasterEggForm } from '@/hooks/useEasterEggForm';

const mockNavigate = jest.fn();
const mockCreate = jest.fn();
const mockGetById = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/services/easterEggService', () => ({
  useEasterEggService: () => ({
    create: mockCreate,
    update: jest.fn(),
    getById: mockGetById,
    uploadImage: jest.fn(),
  }),
}));

jest.mock('@/hooks/useValidatedImageUpload', () => ({
  useValidatedImageUpload: () => ({
    files: [],
    previewUrls: [],
    error: null,
    handleFileChange: jest.fn(),
    clearImages: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
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
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'egg-1' });
  });

  it('validates required fields on submit', async () => {
    const { result } = renderHook(() => useEasterEggForm(), {
      wrapper: createWrapper('/easter-egg-hunt/new'),
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
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
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/easter-egg-hunt');
  });
});
