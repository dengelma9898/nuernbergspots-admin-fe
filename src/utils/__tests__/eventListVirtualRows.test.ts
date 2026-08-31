import { Event } from '@/models/events';
import { buildEventListVirtualRows, estimateVirtualRowSize } from '@/utils/eventListVirtualRows';
import { EventMonthGroup } from '@/utils/eventListUtils';

const createEvent = (id: string): Event => ({
  id,
  title: `Event ${id}`,
  description: 'Beschreibung',
  location: {
    address: 'Nürnberg',
    latitude: 49.45,
    longitude: 11.07,
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  favoriteCount: 0,
  ticketsNeeded: false,
  dailyTimeSlots: [{ date: '2024-06-15', from: '10:00', to: '12:00' }],
});

describe('eventListVirtualRows', () => {
  const groupedEventsByMonth: Record<string, EventMonthGroup> = {
    '2024-06': {
      label: 'Juni 2024',
      date: new Date('2024-06-01'),
      events: [
        createEvent('1'),
        createEvent('2'),
        createEvent('3'),
        createEvent('4'),
        createEvent('5'),
      ],
    },
    '2024-05': {
      label: 'Mai 2024',
      date: new Date('2024-05-01'),
      events: [createEvent('6')],
    },
  };

  it('baut Header und Kartenzeilen pro Monat', () => {
    const rows = buildEventListVirtualRows(['2024-06', '2024-05'], groupedEventsByMonth, 2);

    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({
      type: 'header',
      monthKey: '2024-06',
      label: 'Juni 2024',
    });
    expect(rows[1]).toMatchObject({
      type: 'cards',
      monthKey: '2024-06',
      events: [expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })],
      isLastInMonth: false,
      isLastMonth: false,
    });
    expect(rows[4]).toMatchObject({
      type: 'header',
      monthKey: '2024-05',
    });
    expect(rows[5]).toMatchObject({
      type: 'cards',
      monthKey: '2024-05',
      isLastInMonth: true,
      isLastMonth: true,
    });
  });

  it('schätzt Header-Zeilen kleiner als Kartenzeilen', () => {
    const headerSize = estimateVirtualRowSize({
      type: 'header',
      monthKey: '2024-06',
      label: 'Juni 2024',
    });
    const cardsSize = estimateVirtualRowSize({
      type: 'cards',
      monthKey: '2024-06',
      events: [createEvent('1')],
      isLastInMonth: true,
      isLastMonth: true,
    });

    expect(headerSize).toBeLessThan(cardsSize);
  });
});
