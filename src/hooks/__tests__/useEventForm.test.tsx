import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';

import { useEventForm } from '@/hooks/useEventForm';
import { Event } from '@/models/events';

const mockUpdateEvent = vi.fn();
const mockDeleteEvent = vi.fn();

vi.mock('@/services/eventService', async () => ({
  useEventService: () => ({
    updateEvent: mockUpdateEvent,
    deleteEvent: mockDeleteEvent,
  }),
}));

const mockEvent: Event = {
  id: 'evt-1',
  title: 'Rock Konzert',
  description: 'Live im Club',
  location: { address: 'Hauptstraße 1, Nürnberg', latitude: 49.45, longitude: 11.07 },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  dailyTimeSlots: [],
};

describe('useEventForm', () => {
  const onEventUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateEvent.mockResolvedValue({});
    mockDeleteEvent.mockResolvedValue({});
  });

  it('startet im Nicht-Editier-Modus', () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editedEvent).toEqual({});
  });

  it('aktiviert den Bearbeitungsmodus mit den Event-Daten', () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleEdit();
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.editedEvent).toEqual(mockEvent);
  });

  it('speichert Änderungen und benachrichtigt den Parent', async () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleEdit();
      result.current.handleInputChange('title', 'Neuer Titel');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { ...mockEvent, title: 'Neuer Titel' });
    expect(toast.success).toHaveBeenCalled();
    expect(onEventUpdate).toHaveBeenCalledTimes(1);
    expect(result.current.isEditing).toBe(false);
  });

  it('zeigt Fehler-Toast wenn das Speichern fehlschlägt', async () => {
    mockUpdateEvent.mockRejectedValue(new Error('update failed'));

    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleEdit();
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalled();
    expect(onEventUpdate).not.toHaveBeenCalled();
  });

  it('bricht ab, wenn kein Event vorhanden ist', async () => {
    const { result } = renderHook(() => useEventForm({ event: null, onEventUpdate }));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdateEvent).not.toHaveBeenCalled();
  });

  it('verarbeitet socialMedia-Feld-Updates per Merge', () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleEdit();
      result.current.handleSocialMediaChange('instagram', '@neu');
    });

    expect(result.current.editedEvent.socialMedia).toEqual({ instagram: '@neu' });
  });

  it('handelt den Location-Select', () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleEdit();
      result.current.handleLocationSelect({
        address: { label: 'Andere Straße 2, Nürnberg' },
        position: { lat: 49.5, lng: 11.2 },
      });
    });

    expect(result.current.editedEvent.location).toEqual({
      address: 'Andere Straße 2, Nürnberg',
      latitude: 49.5,
      longitude: 11.2,
    });
    expect(result.current.searchValue).toEqual({
      address: { label: 'Andere Straße 2, Nürnberg' },
      position: { lat: 49.5, lng: 11.2 },
    });
  });

  it('ignoriert null beim Location-Select', () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleLocationSelect(null);
    });

    expect(result.current.editedEvent.location).toBeUndefined();
  });

  it('löscht das Event bei Erfolg', async () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockDeleteEvent).toHaveBeenCalledWith('evt-1');
    expect(toast.success).toHaveBeenCalled();
  });

  it('zeigt Fehler-Toast wenn das Löschen fehlschlägt', async () => {
    mockDeleteEvent.mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('setzt den Bearbeitungsmodus zurück', () => {
    const { result } = renderHook(() => useEventForm({ event: mockEvent, onEventUpdate }));

    act(() => {
      result.current.handleEdit();
      result.current.handleCancel();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editedEvent).toEqual({});
  });
});
