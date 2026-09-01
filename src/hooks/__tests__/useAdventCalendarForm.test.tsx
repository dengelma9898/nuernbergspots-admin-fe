import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAdventCalendarForm } from '@/hooks/useAdventCalendarForm';

const mockNavigate = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockGetById = vi.fn();
const mockUploadImage = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/adventCalendarService', async () => ({
  useAdventCalendarService: () => ({
    create: mockCreate,
    update: mockUpdate,
    getById: mockGetById,
    uploadImage: mockUploadImage,
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
          <Route path="/advent-calendar/new" element={<>{children}</>} />
          <Route path="/advent-calendar/:id/edit" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );
  };

describe('useAdventCalendarForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        preventDefault: vi.fn(),
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
        preventDefault: vi.fn(),
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
