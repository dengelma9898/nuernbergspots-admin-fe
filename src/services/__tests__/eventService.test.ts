// Event Service Tests

// Mock API
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    events: '/events',
  },
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn(response => response.data),
}));

import { useEventService } from '../eventService';

describe('Event Service', () => {
  let eventService: ReturnType<typeof useEventService>;

  beforeEach(() => {
    jest.clearAllMocks();
    eventService = useEventService();
  });

  describe('getEvents', () => {
    it('should fetch all events successfully', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1', description: 'Test Event 1' },
        { id: '2', title: 'Event 2', description: 'Test Event 2' },
      ];
      mockApi.get.mockResolvedValue({ data: mockEvents });

      const result = await eventService.getEvents();

      expect(mockApi.get).toHaveBeenCalledWith('/events');
      expect(result).toEqual(mockEvents);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(eventService.getEvents()).rejects.toThrow('Network error');
    });
  });

  describe('getEvent', () => {
    it('should fetch a specific event', async () => {
      const mockEvent = { id: '1', title: 'Event 1', description: 'Test Event' };
      mockApi.get.mockResolvedValue({ data: mockEvent });

      const result = await eventService.getEvent('1');

      expect(mockApi.get).toHaveBeenCalledWith('/events/1');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const newEvent = {
        title: 'New Event',
        description: 'New Description',
        location: {
          address: 'Test Location',
          latitude: 49.4521,
          longitude: 11.0767,
        },
        dailyTimeSlots: [],
      };
      const createdEvent = {
        id: '1',
        ...newEvent,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApi.post.mockResolvedValue({ data: createdEvent });

      const result = await eventService.createEvent(newEvent);

      expect(mockApi.post).toHaveBeenCalledWith('/events', newEvent);
      expect(result).toEqual(createdEvent);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updates = { title: 'Updated Event' };
      const updatedEvent = { id: '1', title: 'Updated Event', description: 'Test' };
      mockApi.patch.mockResolvedValue({ data: updatedEvent });

      const result = await eventService.updateEvent('1', updates);

      expect(mockApi.patch).toHaveBeenCalledWith('/events/1', updates);
      expect(result).toEqual(updatedEvent);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await eventService.deleteEvent('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/events/1');
    });
  });

  describe('getEventsByDateRange', () => {
    it('should fetch events by date range', async () => {
      const mockEvents = [{ id: '1', title: 'Event in range' }];
      mockApi.get.mockResolvedValue({ data: mockEvents });

      const result = await eventService.getEventsByDateRange('2024-01-01', '2024-01-31');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/events/range?startDate=2024-01-01&endDate=2024-01-31'
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getCurrentEvents', () => {
    it('should fetch current events', async () => {
      const mockEvents = [{ id: '1', title: 'Current Event' }];
      mockApi.get.mockResolvedValue({ data: mockEvents });

      const result = await eventService.getCurrentEvents();

      expect(mockApi.get).toHaveBeenCalledWith('/events/current');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getNearbyEvents', () => {
    it('should fetch nearby events', async () => {
      const mockEvents = [{ id: '1', title: 'Nearby Event' }];
      mockApi.get.mockResolvedValue({ data: mockEvents });

      const result = await eventService.getNearbyEvents(49.4521, 11.0767, 10);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/events/nearby?latitude=49.4521&longitude=11.0767&radiusKm=10'
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getPopularEvents', () => {
    it('should fetch popular events with default limit', async () => {
      const mockEvents = [{ id: '1', title: 'Popular Event' }];
      mockApi.get.mockResolvedValue({ data: mockEvents });

      const result = await eventService.getPopularEvents();

      expect(mockApi.get).toHaveBeenCalledWith('/events/popular?limit=10');
      expect(result).toEqual(mockEvents);
    });

    it('should fetch popular events with custom limit', async () => {
      const mockEvents = [{ id: '1', title: 'Popular Event' }];
      mockApi.get.mockResolvedValue({ data: mockEvents });

      const result = await eventService.getPopularEvents(5);

      expect(mockApi.get).toHaveBeenCalledWith('/events/popular?limit=5');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('uploadEventImages', () => {
    it('should upload event images', async () => {
      const mockFiles = [
        new File(['test'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const mockUrls = ['url1.jpg', 'url2.jpg'];
      mockApi.patch.mockResolvedValue({ data: { urls: mockUrls } });

      const result = await eventService.uploadEventImages('1', mockFiles);

      expect(mockApi.patch).toHaveBeenCalledWith('/events/1/images', expect.any(FormData), {
        isFormData: true,
      });
      expect(result).toEqual(mockUrls);
    });
  });

});
