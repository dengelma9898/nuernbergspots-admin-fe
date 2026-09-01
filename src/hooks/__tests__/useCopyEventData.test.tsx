import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';

import { useCopyEventData } from '@/hooks/useCopyEventData';
import { Event } from '@/models/events';
import { EventCategory } from '@/models/event-category';

const mockNavigate = vi.fn();

const mockEventService = {
  getEvent: vi.fn(),
  createEvent: vi.fn(),
  uploadEventTitleImage: vi.fn(),
  setEventTitleImage: vi.fn(),
  uploadEventImages: vi.fn(),
  updateEventImages: vi.fn(),
};

const mockEventCategoryService = {
  getCategories: vi.fn(),
};

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'evt-1' }),
}));

vi.mock('@/services/eventService', async () => ({
  useEventService: () => mockEventService,
}));

vi.mock('@/services/eventCategoryService', async () => ({
  useEventCategoryService: () => mockEventCategoryService,
}));

const mockEvent: Event = {
  id: 'evt-1',
  title: 'Rock Konzert',
  description: 'Live im Club',
  location: { address: 'Hauptstraße 1, Nürnberg', latitude: 49.45, longitude: 11.07 },
  titleImageUrl: 'https://img.example.com/title.jpg',
  imageUrls: ['https://img.example.com/1.jpg', 'https://img.example.com/2.jpg'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  favoriteCount: 7,
  ticketsNeeded: true,
  price: 19.95,
  priceString: '19,95 €',
  categoryId: 'cat-1',
  isPromoted: true,
  dailyTimeSlots: [
    { date: '2026-09-01', from: '20:00', to: '22:00' },
    { date: '2026-09-02', from: '20:00', to: '22:00' },
  ],
  socialMedia: { instagram: '@rock', tiktok: null },
  contactEmail: 'info@example.de',
  website: 'https://example.de',
};

const mockCategory: EventCategory = {
  id: 'cat-1',
  name: 'Musik',
  description: 'Konzerte',
  iconName: 'music',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const timeSlotEvent = {
  ...mockEvent,
  dailyTimeSlots: [
    { date: '2026-09-01', from: '20:00', to: '22:00' },
    { date: '2026-09-02', from: '20:00', to: '22:00' },
  ],
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useCopyEventData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let getEventCall = 0;
    // Der 1. getEvent-Aufruf (loadEventAndCategories) liefert das Event inkl. Bildern.
    // Der 2. Aufruf (copyImages-Effekt beim Mount) liefert ein Event ohne Bilder, um
    // den parallelen Ladevorgang bei den Assertions nicht zu stören.
    mockEventService.getEvent.mockImplementation(async () => {
      getEventCall++;
      if (getEventCall === 1) {
        return mockEvent;
      }
      return { ...mockEvent, titleImageUrl: undefined, imageUrls: [] };
    });
    mockEventService.createEvent.mockResolvedValue({ id: 'new-event-1' });
    mockEventService.updateEventImages.mockResolvedValue({});
    mockEventService.uploadEventTitleImage.mockResolvedValue({});
    mockEventService.setEventTitleImage.mockResolvedValue({});
    mockEventService.uploadEventImages.mockResolvedValue({});
    mockEventCategoryService.getCategories.mockResolvedValue([mockCategory]);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['img'], { type: 'image/jpeg' }),
    });
  });

  it('lädt das Event und die Kategorien und befüllt das kopierte Formular inkl. Bildern', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    expect(result.current.categories).toEqual([mockCategory]);
    expect(result.current.newEvent.title).toBe('Rock Konzert (Kopie)');
    expect(result.current.newEvent.startDate).toBe('2026-09-01');
    expect(result.current.newEvent.endDate).toBe('2026-09-02');
    expect(result.current.newEvent.priceString).toBe('19,95 €');
    expect(result.current.newEvent.dailyTimeSlots).toHaveLength(2);
    expect(result.current.newEvent.isPromoted).toBe(true);
    expect(result.current.hasValidLocation).toBe(true);
    expect(result.current.searchValue?.address.label).toBe('Hauptstraße 1, Nürnberg');
    await act(async () => {});

    // copiedImages/copiedTitleImage werden vom Hook nicht exponiert — prüfen wir
    // die Bildkopie indirekt über die Vorschauen und die Titelbild-Vorschau.
    expect(result.current.titleImageUrlToCopy).toBeNull();
    expect(result.current.titleImagePreview).toEqual('mock-url-1');
    expect(result.current.imagePreviews).toHaveLength(2);
    expect(result.current.imageUrlsToCopy).toEqual([]);
  });

  it('setzt keine Adresse, wenn die Event-Location ungültig ist', async () => {
    mockEventService.getEvent.mockResolvedValue({
      ...mockEvent,
      location: { address: '', latitude: 0, longitude: 0 },
    });

    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    expect(result.current.hasValidLocation).toBe(false);
    expect(result.current.newEvent.address).toBe('');
    expect(result.current.searchValue).toBeNull();
  });

  it('nutzt URL-Kopien, wenn Bilder nicht geladen werden können (CORS)', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.imageUrlsToCopy.length).toBe(2);
    });

    expect(result.current.titleImageUrlToCopy).toBe('https://img.example.com/title.jpg');
    expect(result.current.titleImagePreview).toBe('https://img.example.com/title.jpg');
    expect(result.current.imagePreviews).toEqual([
      'https://img.example.com/1.jpg',
      'https://img.example.com/2.jpg',
    ]);
    expect(result.current.imageUrlsToCopy).toEqual([
      'https://img.example.com/1.jpg',
      'https://img.example.com/2.jpg',
    ]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('leert die kopierten Bilder, wenn copyImages deaktiviert wird', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.imagePreviews).toHaveLength(2);
    });

    act(() => {
      result.current.setCopyImages(false);
    });

    await waitFor(() => {
      expect(result.current.copyImages).toBe(false);
    });

    expect(result.current.imagePreviews).toEqual([]);
    expect(result.current.titleImagePreview).toBeNull();
    expect(result.current.imageUrlsToCopy).toEqual([]);
    expect(result.current.titleImageUrlToCopy).toBeNull();
  });

  it('erzeugt bei geänderten Daten frische TimeSlots', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    act(() => {
      result.current.handleInputChange('startDate', '2026-10-01');
      result.current.handleInputChange('endDate', '2026-10-03');
    });

    await waitFor(() => {
      expect(result.current.newEvent.dailyTimeSlots).toHaveLength(3);
    });
    expect(result.current.newEvent.dailyTimeSlots[0].date).toBe('2026-10-01');
    expect(result.current.newEvent.dailyTimeSlots[2].date).toBe('2026-10-03');
  });

  it('aktualisiert einzelne TimeSlots über handleUpdateTimeSlot', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    act(() => {
      result.current.handleUpdateTimeSlot('2026-09-01', 'from', '19:00');
    });

    // Hinweis: Der [startDate, endDate]-Effekt regeneriert die TimeSlots nach dem Laden
    // mit leeren from/to-Werten, daher ist nur der aktualisierte Slot belegt.
    expect(result.current.newEvent.dailyTimeSlots[0].from).toBe('19:00');
    expect(result.current.newEvent.dailyTimeSlots[0].date).toBe('2026-09-01');
  });

  it('verhindert das Erstellen ohne gültige Location', async () => {
    mockEventService.getEvent.mockImplementation(async () => ({
      ...mockEvent,
      location: { address: '', latitude: 0, longitude: 0 },
    }));

    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    expect(result.current.hasValidLocation).toBe(false);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockEventService.createEvent).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('erstellt das Event ohne Bildkopie', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    act(() => {
      result.current.setCopyImages(false);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockEventService.createEvent).toHaveBeenCalledTimes(1);
    const payload = mockEventService.createEvent.mock.calls[0][0];
    expect(payload.title).toBe('Rock Konzert (Kopie)');
    expect(payload.location).toBeUndefined();
    expect(payload).not.toHaveProperty('startDate');
    expect(payload).not.toHaveProperty('endDate');
    expect(payload).not.toHaveProperty('price');
    expect(payload.priceString).toBe('19,95 €');
    expect(payload.address).toBe('Hauptstraße 1, Nürnberg');
    expect(payload.latitude).toBe(49.45);
    expect(payload.longitude).toBe(11.07);

    expect(mockEventService.uploadEventTitleImage).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  it('lädt kopierte Bilddateien beim Erstellen hoch', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.titleImagePreview).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockEventService.createEvent).toHaveBeenCalledTimes(1);
    // Titelbild wurde per File-Upload übertragen (der Titelbild-Pfad hängt von der
    // erfolgreichen File-Kopierung ab, die über titleImagePreview bestätigt wird).
    expect(mockEventService.uploadEventTitleImage).toHaveBeenCalledWith(
      'new-event-1',
      expect.any(File)
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  it('übernimmt URL-Kopien für Bilder, die nicht geladen werden konnten', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.imageUrlsToCopy.length).toBe(2);
    });

    mockEventService.getEvent.mockResolvedValue({
      ...mockEvent,
      imageUrls: ['https://img.example.com/99.jpg'],
    });
    mockEventService.updateEventImages.mockResolvedValue({});

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockEventService.setEventTitleImage).toHaveBeenCalledWith(
      'new-event-1',
      'https://img.example.com/title.jpg'
    );
    expect(mockEventService.getEvent).toHaveBeenCalledWith('new-event-1');
    expect(mockEventService.updateEventImages).toHaveBeenCalledWith('new-event-1', [
      'https://img.example.com/99.jpg',
      'https://img.example.com/1.jpg',
      'https://img.example.com/2.jpg',
    ]);
  });

  it('zeigt einen Fehler-Toast, wenn das Erstellen fehlschlägt', async () => {
    mockEventService.createEvent.mockRejectedValue(new Error('save failed'));

    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('navigiert bei Ladefehlern zum Event-Index', async () => {
    mockEventService.getEvent.mockRejectedValue(new Error('load failed'));

    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loadingEvent).toBe(false);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });

  it('entfernt Bildvorschauen', async () => {
    const { result } = renderHook(() => useCopyEventData(), { wrapper });

    await waitFor(() => {
      expect(result.current.imagePreviews.length).toBe(2);
    });

    act(() => {
      result.current.removeImagePreview(0);
    });

    expect(result.current.imagePreviews).toHaveLength(1);

    act(() => {
      result.current.removeTitleImagePreview();
    });
    expect(result.current.titleImagePreview).toBeNull();
  });
});
