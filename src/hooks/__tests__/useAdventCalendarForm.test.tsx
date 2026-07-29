import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAdventCalendarForm } from '@/hooks/useAdventCalendarForm';

const mockNavigate = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockGetById = jest.fn();
const mockUploadImage = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/services/adventCalendarService', () => ({
  useAdventCalendarService: () => ({
    create: mockCreate,
    update: mockUpdate,
    getById: mockGetById,
    uploadImage: mockUploadImage,
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
          <Route path="/advent-calendar/new" element={<>{children}</>} />
          <Route path="/advent-calendar/:id/edit" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );
  };

describe('useAdventCalendarForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'new-1' });
    mockUpdate.mockResolvedValue({ id: 'entry-1' });
    mockGetById.mockResolvedValue({
      id: 'entry-1',
      number: 5,
      canParticipate: true,
      isActive: true,
      date: '2024-12-05',
      isSpecial: false,
      description: 'Bestehend',
      linkUrl: undefined,
      imageUrl: '',
    });
  });

  it('validates required description on submit', async () => {
    const { result } = renderHook(() => useAdventCalendarForm(), {
      wrapper: createWrapper('/advent-calendar/new'),
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.validationErrors).toContain('Bitte geben Sie eine Beschreibung ein');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates entry when form is valid', async () => {
    const { result } = renderHook(() => useAdventCalendarForm(), {
      wrapper: createWrapper('/advent-calendar/new'),
    });

    act(() => {
      result.current.setFormData(prev => ({ ...prev, description: 'Neuer Eintrag' }));
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/advent-calendar');
  });

  it('loads existing entry when id is present', async () => {
    const { result } = renderHook(() => useAdventCalendarForm(), {
      wrapper: createWrapper('/advent-calendar/entry-1/edit'),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetById).toHaveBeenCalledWith('entry-1');
    expect(result.current.formData.description).toBe('Bestehend');
  });
});
