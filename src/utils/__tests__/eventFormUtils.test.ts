import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDailyTimeSlots,
  updateTimeSlotInForm,
  buildCreateEventPayload,
  buildCopyEventPayload,
  urlToFile,
  isValidEventLocation,
  formatEventPriceString,
} from '@/utils/eventFormUtils';
import { createEmptyEventFormState } from '@/components/events/event-form/types';

describe('generateDailyTimeSlots', () => {
  it('liefert leeres Array wenn Start- oder Enddatum fehlt', () => {
    expect(generateDailyTimeSlots('', '2026-09-03')).toEqual([]);
    expect(generateDailyTimeSlots('2026-09-03', '')).toEqual([]);
  });

  it('erzeugt einen Slot pro Tag im Intervall (inklusive Enddatum)', () => {
    const slots = generateDailyTimeSlots('2026-09-01', '2026-09-03');
    expect(slots).toHaveLength(3);
    expect(slots.map(s => s.date)).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
    expect(slots[0]).toEqual({ date: '2026-09-01', from: undefined, to: undefined });
  });

  it('erzeugt einen einzelnen Slot bei gleichem Start- und Enddatum', () => {
    const slots = generateDailyTimeSlots('2026-12-24', '2026-12-24');
    expect(slots).toHaveLength(1);
    expect(slots[0].date).toBe('2026-12-24');
  });
});

describe('updateTimeSlotInForm', () => {
  const slots = [
    { date: '2026-09-01', from: '20:00', to: undefined },
    { date: '2026-09-02', from: undefined, to: undefined },
  ];

  it('aktualisiert das passende Feld am passenden Tag', () => {
    const updated = updateTimeSlotInForm(slots, '2026-09-01', 'to', '22:00');
    expect(updated[0]).toEqual({ date: '2026-09-01', from: '20:00', to: '22:00' });
  });

  it('lässt nicht betroffene Slots unverändert', () => {
    const updated = updateTimeSlotInForm(slots, '2026-09-02', 'from', '19:00');
    expect(updated[0]).toEqual(slots[0]);
    expect(updated[1]).toEqual({ date: '2026-09-02', from: '19:00', to: undefined });
  });

  it('liefert Kopien statt Mutationen zurück', () => {
    const updated = updateTimeSlotInForm(slots, '2026-09-01', 'from', '21:00');
    expect(updated).not.toBe(slots);
    expect(slots[0].from).toBe('20:00');
  });
});

describe('buildCreateEventPayload', () => {
  it('verpackt Adresse und Koordinaten in das location-Objekt', () => {
    const form = {
      ...createEmptyEventFormState(),
      address: 'Teststraße 1, Nürnberg',
      latitude: 49.4,
      longitude: 11.1,
    };
    const payload = buildCreateEventPayload(form);
    expect(payload.location).toEqual({
      address: 'Teststraße 1, Nürnberg',
      latitude: 49.4,
      longitude: 11.1,
    });
    expect(payload.address).toBe('Teststraße 1, Nürnberg');
  });
});

describe('buildCopyEventPayload', () => {
  it('entfernt startDate, endDate und price und setzt priceString', () => {
    const form = {
      ...createEmptyEventFormState(),
      title: 'Event (Kopie)',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      price: 12.5,
      priceString: '12,50 €',
    };
    const payload = buildCopyEventPayload(form);
    expect(payload).not.toHaveProperty('startDate');
    expect(payload).not.toHaveProperty('endDate');
    expect(payload).not.toHaveProperty('price');
    expect(payload.priceString).toBe('12,50 €');
    expect(payload.title).toBe('Event (Kopie)');
  });

  it('setzt priceString auf undefined wenn leer', () => {
    const form = {
      ...createEmptyEventFormState(),
      priceString: '',
    };
    expect(buildCopyEventPayload(form).priceString).toBeUndefined();
  });

  it('behält das location-Objekt bei', () => {
    const form = {
      ...createEmptyEventFormState(),
      address: 'Neue Straße 2, Nürnberg',
      latitude: 49.5,
      longitude: 11.2,
    };
    const payload = buildCopyEventPayload(form);
    expect(payload.address).toBe('Neue Straße 2, Nürnberg');
    expect(payload.latitude).toBe(49.5);
    expect(payload.longitude).toBe(11.2);
  });
});

describe('urlToFile', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
    vi.stubGlobal('fetch', global.fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lädt das Bild und erstellt eine Datei mit korrektem Namen und Typ', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['abc'], { type: 'image/png' }),
    });

    const file = await urlToFile('https://example.com/img.png', 'bild.png');
    expect(file.name).toBe('bild.png');
    expect(file.type).toBe('image/png');
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/img.png', {
      mode: 'cors',
      credentials: 'omit',
    });
  });

  it('verwendet image/jpeg als Fallback, wenn der Blob keinen Typ hat', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['abc']),
    });

    const file = await urlToFile('https://example.com/img', 'bild');
    expect(file.type).toBe('image/jpeg');
  });

  it('wirft einen CORS_ERROR wenn die Antwort nicht ok ist', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false });

    await expect(urlToFile('https://example.com/img', 'bild')).rejects.toThrow('CORS_ERROR');
  });

  it('wirft einen CORS_ERROR bei Netzwerkfehler', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await urlToFile('https://example.com/img', 'bild');
      throw new Error('sollte nicht hier ankommen');
    } catch (error) {
      expect((error as Error).message).toContain('CORS_ERROR');
    }
  });
});

describe('isValidEventLocation', () => {
  it('validiert nur Adressen mit von null verschiedenem Lat/Lng', () => {
    expect(isValidEventLocation('Hauptstraße 1, Nürnberg', 49.45, 11.07)).toBe(true);
    expect(isValidEventLocation('', 49.45, 11.07)).toBe(false);
    expect(isValidEventLocation('   ', 49.45, 11.07)).toBe(false);
    expect(isValidEventLocation('Hauptstraße 1, Nürnberg', 0, 11.07)).toBe(false);
    expect(isValidEventLocation('Hauptstraße 1, Nürnberg', 49.45, 0)).toBe(false);
    expect(isValidEventLocation('Hauptstraße 1, Nürnberg', 49.45, 11.07)).toBe(true);
  });
});

describe('formatEventPriceString', () => {
  it('bevorzugt priceString', () => {
    expect(formatEventPriceString('12,50 €', 5)).toBe('12,50 €');
  });

  it('formatiert den Preis als Euro mit de-DE-Separator', () => {
    expect(formatEventPriceString(null, 12.5)).toBe('12,50 €');
    expect(formatEventPriceString(undefined, 0)).toBe('0,00 €');
  });

  it('liefert null wenn weder priceString noch price vorhanden sind', () => {
    expect(formatEventPriceString(null, null)).toBeNull();
    expect(formatEventPriceString(undefined, undefined)).toBeNull();
    expect(formatEventPriceString('', undefined)).toBeNull();
  });
});
