import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';

import { useImageUpload } from '@/hooks/useImageUpload';
import { Event } from '@/models/events';

const mockUploadEventImages = vi.fn();
const mockUploadEventTitleImage = vi.fn();
const mockUpdateEvent = vi.fn();
const mockRemoveEventImage = vi.fn();

vi.mock('@/services/eventService', async () => ({
  useEventService: () => ({
    uploadEventImages: mockUploadEventImages,
    uploadEventTitleImage: mockUploadEventTitleImage,
    updateEvent: mockUpdateEvent,
    removeEventImage: mockRemoveEventImage,
  }),
}));

const makeFile = (name: string, size = 1024, type = 'image/jpeg') => {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
};

const baseEvent: Event = {
  id: 'evt-1',
  title: 'Event',
  description: 'Beschreibung',
  location: { address: 'Hauptstraße 1, Nürnberg', latitude: 49.45, longitude: 11.07 },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  imageUrls: ['https://img.example.com/a.jpg'],
  dailyTimeSlots: [],
};

describe('useImageUpload', () => {
  const onEventUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadEventImages.mockResolvedValue({});
    mockUploadEventTitleImage.mockResolvedValue('https://img.example.com/t.jpg');
    mockUpdateEvent.mockResolvedValue({});
    mockRemoveEventImage.mockResolvedValue({});
  });

  it('lädt Bilder hoch und aktualisiert die Ansicht', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));
    const files = [makeFile('a.jpg'), makeFile('b.jpg')];

    await act(async () => {
      await result.current.handleUploadImages(files);
    });

    expect(mockUploadEventImages).toHaveBeenCalledWith('evt-1', files);
    expect(result.current.selectedFiles).toEqual([]);
    expect(result.current.previewUrls).toEqual([]);
    expect(result.current.imagesChanged).toBe(true);
    expect(toast.success).toHaveBeenCalled();
    expect(onEventUpdate).toHaveBeenCalled();
  });

  it('macht nichts ohne Dateien oder Event', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    await act(async () => {
      await result.current.handleUploadImages([]);
    });

    expect(mockUploadEventImages).not.toHaveBeenCalled();

    const { result: noEvent } = renderHook(() => useImageUpload({ event: null, onEventUpdate }));
    await act(async () => {
      await noEvent.current.handleUploadImages([makeFile('a.jpg')]);
    });
    expect(mockUploadEventImages).not.toHaveBeenCalled();
  });

  it('zeigt Fehler-Toast, wenn der Upload fehlschlägt', async () => {
    mockUploadEventImages.mockRejectedValue(new Error('upload failed'));

    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    await act(async () => {
      await result.current.handleUploadImages([makeFile('a.jpg')]);
    });

    expect(toast.error).toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });

  it('lädt das Titelbild hoch und aktualisiert das Event', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    await act(async () => {
      await result.current.handleUploadTitleImage(makeFile('title.jpg'));
    });

    expect(mockUploadEventTitleImage).toHaveBeenCalledWith('evt-1', expect.any(File));
    expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', {
      ...baseEvent,
      titleImageUrl: 'https://img.example.com/t.jpg',
    });
    expect(result.current.imagesChanged).toBe(true);
    expect(toast.success).toHaveBeenCalled();
  });

  it('zeigt Fehler-Toast, wenn das Titelbild-Hochladen fehlschlägt', async () => {
    mockUploadEventTitleImage.mockRejectedValue(new Error('title upload failed'));

    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    await act(async () => {
      await result.current.handleUploadTitleImage(makeFile('title.jpg'));
    });

    expect(toast.error).toHaveBeenCalled();
    expect(result.current.isUploadingTitleImage).toBe(false);
  });

  it('validiert das Limit von 5 Bildern bei der Dateiauswahl', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));
    const files = Array.from({ length: 5 }, (_, i) => makeFile(`${i}.jpg`));

    act(() => {
      result.current.handleFileChange({
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    // 1 bestehendes Bild + 5 neue = 6 → zu viele
    expect(result.current.imageLimitError).toBe('Maximal 5 Bilder erlaubt.');
    expect(mockUploadEventImages).not.toHaveBeenCalled();
  });

  it('löst beim Zurücksetzen unter dem Limit einen automatischen Upload aus', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));
    const files = [makeFile('a.jpg')];

    act(() => {
      result.current.handleFileChange({
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.imageLimitError).toBeNull();
    expect(result.current.selectedFiles).toEqual(files);
    expect(mockUploadEventImages).toHaveBeenCalledWith('evt-1', files);
  });

  it('setzt das Titelbild beim Titelbild-Change', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    act(() => {
      result.current.handleTitleImageChange({
        target: { files: [makeFile('t.jpg')] },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockUploadEventTitleImage).toHaveBeenCalledWith('evt-1', expect.any(File));
  });

  it('entfernt Vorschauen über removePreview', () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    act(() => {
      result.current.setSelectedFiles([makeFile('a.jpg'), makeFile('b.jpg')]);
      result.current.setPreviewUrls(['url-a', 'url-b']);
    });

    act(() => {
      result.current.removePreview(0);
    });

    expect(result.current.selectedFiles).toHaveLength(1);
    expect(result.current.previewUrls).toEqual(['url-b']);
  });

  it('setzt das zu löschende Bild über handleDeleteImage', () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    act(() => {
      result.current.handleDeleteImage('https://img.example.com/a.jpg');
    });

    expect(result.current.imageToDelete).toBe('https://img.example.com/a.jpg');
  });

  it('bestätigt das Löschen eines Bildes', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    act(() => {
      result.current.handleDeleteImage('https://img.example.com/a.jpg');
    });

    await act(async () => {
      await result.current.confirmDeleteImage();
    });

    expect(mockRemoveEventImage).toHaveBeenCalledWith('evt-1', 'https://img.example.com/a.jpg');
    expect(result.current.imagesChanged).toBe(true);
    expect(result.current.imageToDelete).toBeNull();
    expect(toast.success).toHaveBeenCalled();
  });

  it('macht nichts beim Löschen, wenn keine URL gesetzt ist', async () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    await act(async () => {
      await result.current.confirmDeleteImage();
    });

    expect(mockRemoveEventImage).not.toHaveBeenCalled();
  });

  it('bestätigt Bildänderungen über handleConfirmImages', () => {
    const { result } = renderHook(() => useImageUpload({ event: baseEvent, onEventUpdate }));

    act(() => {
      result.current.setImagesChanged(true);
      result.current.handleConfirmImages();
    });

    expect(result.current.imagesChanged).toBe(false);
    expect(onEventUpdate).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});
