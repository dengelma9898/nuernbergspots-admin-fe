// Easter Egg Service Tests

// Mock API
const mockApi = {
  getData: jest.fn(),
  postData: jest.fn(),
  patchData: jest.fn(),
  putData: jest.fn(),
  deleteData: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
}));

import { useEasterEggService } from '../easterEggService';

describe('Easter Egg Service', () => {
  let easterEggService: ReturnType<typeof useEasterEggService>;

  beforeEach(() => {
    jest.clearAllMocks();
    easterEggService = useEasterEggService();
  });

  // --- Feature Status ---

  describe('getFeatureStatus', () => {
    it('should fetch the feature status', async () => {
      const mockStatus = { isFeatureActive: true, startDate: '2026-03-28' };
      mockApi.getData.mockResolvedValue(mockStatus);

      const result = await easterEggService.getFeatureStatus();

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/feature-status');
      expect(result).toEqual(mockStatus);
    });

    it('should handle API errors', async () => {
      mockApi.getData.mockRejectedValue(new Error('Network error'));

      await expect(easterEggService.getFeatureStatus()).rejects.toThrow('Network error');
    });
  });

  describe('setFeatureStatus', () => {
    it('should update feature status with isFeatureActive and startDate', async () => {
      const mockStatus = { isFeatureActive: true, startDate: '2026-03-28' };
      mockApi.putData.mockResolvedValue(mockStatus);

      const result = await easterEggService.setFeatureStatus(true, '2026-03-28');

      expect(mockApi.putData).toHaveBeenCalledWith('/easter-egg-hunt/feature-status', {
        isFeatureActive: true,
        startDate: '2026-03-28',
      });
      expect(result).toEqual(mockStatus);
    });

    it('should update feature status without startDate', async () => {
      const mockStatus = { isFeatureActive: false };
      mockApi.putData.mockResolvedValue(mockStatus);

      const result = await easterEggService.setFeatureStatus(false);

      expect(mockApi.putData).toHaveBeenCalledWith('/easter-egg-hunt/feature-status', {
        isFeatureActive: false,
        startDate: undefined,
      });
      expect(result).toEqual(mockStatus);
    });
  });

  // --- CRUD ---

  describe('getAll', () => {
    it('should fetch all eggs with activeOnly=false', async () => {
      const mockEggs = [
        { id: '1', title: 'Ei 1' },
        { id: '2', title: 'Ei 2' },
      ];
      mockApi.getData.mockResolvedValue(mockEggs);

      const result = await easterEggService.getAll(false);

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/eggs?activeOnly=false');
      expect(result).toEqual(mockEggs);
    });

    it('should default to activeOnly=false', async () => {
      mockApi.getData.mockResolvedValue([]);

      await easterEggService.getAll();

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/eggs?activeOnly=false');
    });

    it('should fetch only active eggs', async () => {
      mockApi.getData.mockResolvedValue([]);

      await easterEggService.getAll(true);

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/eggs?activeOnly=true');
    });
  });

  describe('getById', () => {
    it('should fetch a specific egg', async () => {
      const mockEgg = { id: 'abc-123', title: 'Goldenes Ei' };
      mockApi.getData.mockResolvedValue(mockEgg);

      const result = await easterEggService.getById('abc-123');

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/eggs/abc-123');
      expect(result).toEqual(mockEgg);
    });
  });

  describe('create', () => {
    it('should create a new egg', async () => {
      const newEgg = {
        title: 'Goldenes Ei',
        description: 'Versteckt hinter dem Brunnen',
        numberOfWinners: 1,
        startDate: '2026-03-28',
        address: 'Hauptmarkt 1, 90403 Nürnberg',
        latitude: 49.4539,
        longitude: 11.0775,
      };
      const createdEgg = { id: 'abc-123', ...newEgg };
      mockApi.postData.mockResolvedValue(createdEgg);

      const result = await easterEggService.create(newEgg);

      expect(mockApi.postData).toHaveBeenCalledWith('/easter-egg-hunt/eggs', newEgg);
      expect(result).toEqual(createdEgg);
    });
  });

  describe('update', () => {
    it('should update an existing egg', async () => {
      const updates = { title: 'Aktualisiertes Ei' };
      const updatedEgg = { id: 'abc-123', title: 'Aktualisiertes Ei' };
      mockApi.patchData.mockResolvedValue(updatedEgg);

      const result = await easterEggService.update('abc-123', updates);

      expect(mockApi.patchData).toHaveBeenCalledWith('/easter-egg-hunt/eggs/abc-123', updates);
      expect(result).toEqual(updatedEgg);
    });
  });

  describe('delete', () => {
    it('should delete an egg', async () => {
      mockApi.delete.mockResolvedValue(undefined);

      await easterEggService.delete('abc-123');

      expect(mockApi.delete).toHaveBeenCalledWith('/easter-egg-hunt/eggs/abc-123');
    });
  });

  // --- Image Upload ---

  describe('uploadImage', () => {
    it('should upload an image for an egg', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockEgg = { id: 'abc-123', imageUrl: 'http://example.com/image.png' };
      mockApi.postData.mockResolvedValue(mockEgg);

      const result = await easterEggService.uploadImage('abc-123', mockFile);

      expect(mockApi.postData).toHaveBeenCalledWith(
        '/easter-egg-hunt/eggs/abc-123/image',
        expect.any(FormData),
        { isFormData: true }
      );
      expect(result).toEqual(mockEgg);
    });
  });

  // --- Winners ---

  describe('addWinner', () => {
    it('should add a winner to an egg', async () => {
      const mockEgg = { id: 'abc-123', winnerCount: 1 };
      mockApi.patchData.mockResolvedValue(mockEgg);

      const result = await easterEggService.addWinner('abc-123', { userId: 'user-456' });

      expect(mockApi.patchData).toHaveBeenCalledWith('/easter-egg-hunt/eggs/abc-123/winners', {
        userId: 'user-456',
      });
      expect(result).toEqual(mockEgg);
    });
  });

  describe('drawWinners', () => {
    it('should draw winners for an egg', async () => {
      const mockEgg = { id: 'abc-123', winnerCount: 2 };
      mockApi.postData.mockResolvedValue(mockEgg);

      const result = await easterEggService.drawWinners('abc-123');

      expect(mockApi.postData).toHaveBeenCalledWith(
        '/easter-egg-hunt/eggs/abc-123/draw-winners',
        {}
      );
      expect(result).toEqual(mockEgg);
    });
  });

  // --- Participants ---

  describe('getParticipants', () => {
    it('should fetch participants for an egg', async () => {
      const mockParticipants = ['user-1', 'user-2', 'user-3'];
      mockApi.getData.mockResolvedValue(mockParticipants);

      const result = await easterEggService.getParticipants('abc-123');

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/eggs/abc-123/participants');
      expect(result).toEqual(mockParticipants);
    });
  });

  // --- Statistics ---

  describe('getStatistics', () => {
    it('should fetch statistics', async () => {
      const mockStats = {
        totalEggs: 10,
        activeEggs: 7,
        totalParticipants: 142,
        totalWinners: 3,
        participantsPerEgg: [
          {
            eggId: 'abc-123',
            title: 'Goldenes Ei',
            participantCount: 23,
            winnerCount: 1,
          },
        ],
      };
      mockApi.getData.mockResolvedValue(mockStats);

      const result = await easterEggService.getStatistics();

      expect(mockApi.getData).toHaveBeenCalledWith('/easter-egg-hunt/statistics');
      expect(result).toEqual(mockStats);
    });
  });
});
