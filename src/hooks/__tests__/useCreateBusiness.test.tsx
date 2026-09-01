import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useCreateBusiness } from '@/hooks/useCreateBusiness';
import { BusinessStatus } from '@/models/business';
import { toast } from 'sonner';

const mockNavigate = vi.fn();

const mockBusinessService = {
  createBusiness: vi.fn(),
};

const mockBusinessCategoryService = {
  getCategories: vi.fn(),
};

const mockKeywordService = {
  getKeyword: vi.fn(),
};

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/businessService', async () => ({
  useBusinessService: () => mockBusinessService,
}));

vi.mock('@/services/businessCategoryService', async () => ({
  useBusinessCategoryService: () => mockBusinessCategoryService,
}));

vi.mock('@/services/keywordService', async () => ({
  useKeywordService: () => mockKeywordService,
}));

const mockCategory = {
  id: 'cat-1',
  name: 'Restaurant',
  description: 'Restaurants und Gastronomie',
  iconName: 'utensils',
  keywords: [
    { id: 'keyword-1', name: 'Pizza', description: 'Gericht', createdAt: '', updatedAt: '' },
    { id: 'keyword-2', name: 'Italienisch', description: 'Küche', createdAt: '', updatedAt: '' },
  ],
  createdAt: '',
  updatedAt: '',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useCreateBusiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBusinessCategoryService.getCategories.mockResolvedValue([mockCategory]);
    mockKeywordService.getKeyword.mockImplementation((id: string) =>
      Promise.resolve({
        id,
        name: id,
        description: 'Keyword',
        createdAt: '',
        updatedAt: '',
      })
    );
    mockBusinessService.createBusiness.mockResolvedValue({ id: 'new-business-id' });
  });

  it('lädt Kategorien beim Mount und zeigt Fehler-Toast bei Service-Fehler', async () => {
    mockBusinessCategoryService.getCategories.mockRejectedValue(new Error('netzwerk kaputt'));

    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(result.current.categories).toEqual([]);
  });

  it('zeigt Fehler-Toast, wenn Keywords nicht geladen werden können', async () => {
    mockKeywordService.getKeyword.mockRejectedValue(new Error('keyword kaputt'));

    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await act(async () => {
      result.current.toggleCategory('cat-1');
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('erlaubt maximal 3 Kategorien und zeigt eine Validierungsmeldung', async () => {
    mockBusinessCategoryService.getCategories.mockResolvedValue([
      mockCategory,
      { ...mockCategory, id: 'cat-2', name: 'Café' },
      { ...mockCategory, id: 'cat-3', name: 'Bar' },
      { ...mockCategory, id: 'cat-4', name: 'Shop' },
    ]);

    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(4);
    });

    act(() => {
      result.current.toggleCategory('cat-1');
      result.current.toggleCategory('cat-2');
      result.current.toggleCategory('cat-3');
      result.current.toggleCategory('cat-4');
    });

    expect(result.current.newBusiness.categoryIds).toEqual(['cat-1', 'cat-2', 'cat-3']);
    expect(result.current.validationErrors).toEqual(['Sie können maximal 3 Kategorien auswählen.']);

    act(() => {
      result.current.toggleCategory('cat-3');
    });
    expect(result.current.newBusiness.categoryIds).toEqual(['cat-1', 'cat-2']);
    // Hinweis: Der Fehler wird erst beim erneuten Auswählen einer Kategorie geleert
    expect(result.current.validationErrors).toEqual(['Sie können maximal 3 Kategorien auswählen.']);

    act(() => {
      result.current.toggleCategory('cat-3');
    });
    expect(result.current.newBusiness.categoryIds).toEqual(['cat-1', 'cat-2', 'cat-3']);
    expect(result.current.validationErrors).toEqual([]);
  });

  it('lädt Keywords für die ausgewählten Kategorien', async () => {
    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(1);
    });

    act(() => {
      result.current.toggleCategory('cat-1');
    });

    await waitFor(() => {
      expect(result.current.keywords).toHaveLength(2);
    });
  });

  it('parst die Adresse und bereinigt leere Kontaktdaten beim Erstellen', async () => {
    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await act(async () => {
      result.current.handleInputChange('name', 'Test Restaurant');
      result.current.handleInputChange('description', 'Tolle Beschreibung');
      result.current.handleLocationSelect({
        address: { label: 'Hauptstraße 123, 90402 Nürnberg' },
        position: { lat: 49.45, lng: 11.08 },
      } as never);
      result.current.toggleCategory('cat-1');
      result.current.toggleKeyword('keyword-1');
    });

    await waitFor(() => {
      expect(result.current.newBusiness.name).toBe('Test Restaurant');
    });

    await act(async () => {
      result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockBusinessService.createBusiness).toHaveBeenCalledTimes(1);
    });

    const payload = mockBusinessService.createBusiness.mock.calls[0][0];
    expect(payload.name).toBe('Test Restaurant');
    expect(payload.status).toBe(BusinessStatus.PENDING);
    expect(payload.hasAccount).toBe(false);
    expect(payload.isAdmin).toBe(true);
    expect(payload.address).toEqual({
      street: 'Hauptstraße',
      houseNumber: '123',
      postalCode: '90402',
      city: 'Nürnberg',
      latitude: 49.45,
      longitude: 11.08,
    });
    expect(payload.contact).toEqual({
      email: undefined,
      phoneNumber: undefined,
      website: undefined,
      instagram: undefined,
      facebook: undefined,
      tiktok: undefined,
    });
    expect(payload.keywordIds).toEqual(['keyword-1']);
    expect(payload.detailedOpeningHours.Montag).toEqual([{ from: '09:00', to: '18:00' }]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/businesses');
    });
  });

  it('zeigt Validierungsfehler von der API-Response an', async () => {
    mockBusinessService.createBusiness.mockRejectedValue({
      response: { status: 400, data: { message: ['Fehler A', 'Fehler B'] } },
    });

    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await act(async () => {
      result.current.handleInputChange('name', 'Test Restaurant');
      result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.validationErrors).toEqual(['Fehler A', 'Fehler B']);
    });
  });

  it('zeigt Fehler-Toast bei nicht validierungsbezogenem Fehler beim Erstellen', async () => {
    mockBusinessService.createBusiness.mockRejectedValue(new Error('saving kaputt'));

    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    await act(async () => {
      result.current.handleInputChange('name', 'Test Restaurant');
      result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('validiert TimeSlots: kein Tag ausgewählt → Validierungsfehler, sonst wird Zeitraum ergänzt', async () => {
    const { result } = renderHook(() => useCreateBusiness(), { wrapper });

    act(() => {
      result.current.addTimeSlot();
    });

    expect(result.current.validationErrors[0]).toContain('mindestens einen Tag');
    expect(result.current.timeSlots).toHaveLength(1);

    act(() => {
      result.current.toggleDayForNewTimeSlot('Samstag');
    });

    await waitFor(() => {
      expect(result.current.newTimeSlot.days).toEqual(['Samstag']);
    });

    act(() => {
      result.current.addTimeSlot();
    });

    expect(result.current.timeSlots).toHaveLength(2);
    expect(result.current.timeSlots[1].days).toEqual(['Samstag']);
    expect(result.current.validationErrors).toEqual([]);

    act(() => {
      result.current.toggleDayForTimeSlot('Sonntag', result.current.timeSlots[1].id);
    });

    expect(result.current.timeSlots[1].days).toEqual(['Samstag', 'Sonntag']);

    act(() => {
      result.current.toggleDayForTimeSlot('Samstag', result.current.timeSlots[1].id);
    });
    expect(result.current.timeSlots[1].days).toEqual(['Sonntag']);
  });
});
