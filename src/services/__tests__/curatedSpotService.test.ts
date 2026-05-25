const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    curatedSpots: '/curated-spots',
    curatedSpotsAdmin: '/curated-spots/admin',
    curatedSpotAdminById: (id: string) => `/curated-spots/admin/${id}`,
    curatedSpotImages: (id: string) => `/curated-spots/${id}/images`,
    curatedSpotVideo: (id: string) => `/curated-spots/${id}/video`,
    curatedSpotsUserRatingsSettings: '/curated-spots/settings/user-ratings',
  },
}));

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn((response: { data: unknown }) => response.data),
}));

import { useCuratedSpotService } from '../curatedSpotService';

describe('curatedSpotService', () => {
  let service: ReturnType<typeof useCuratedSpotService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = useCuratedSpotService();
  });

  const sampleAddress = {
    street: 'Königstraße',
    houseNumber: '1',
    postalCode: '90402',
    city: 'Nürnberg',
    latitude: 49.45,
    longitude: 11.08,
  };

  const sampleSpot = {
    id: 'spot-1',
    name: 'Café',
    nameLower: 'café',
    descriptionMarkdown: 'Hi',
    imageUrls: [] as string[],
    keywordIds: [] as string[],
    address: sampleAddress,
    videoUrl: null as string | null,
    instagramUrl: null as string | null,
    status: 'PENDING' as const,
    isDeleted: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdByUserId: 'u1',
  };

  it('listAdmin calls GET /curated-spots/admin', async () => {
    mockApi.get.mockResolvedValue({ data: [sampleSpot] });
    const list = await service.listAdmin();
    expect(mockApi.get).toHaveBeenCalledWith('/curated-spots/admin');
    expect(list).toEqual([sampleSpot]);
  });

  it('getAdmin calls GET /curated-spots/admin/:id', async () => {
    mockApi.get.mockResolvedValue({ data: sampleSpot });
    const spot = await service.getAdmin('spot-1');
    expect(mockApi.get).toHaveBeenCalledWith('/curated-spots/admin/spot-1');
    expect(spot).toEqual(sampleSpot);
  });

  it('create posts to /curated-spots', async () => {
    mockApi.post.mockResolvedValue({ data: sampleSpot });
    const dto = {
      name: 'Café',
      descriptionMarkdown: 'Hi',
      address: sampleAddress,
      status: 'PENDING' as const,
    };
    const spot = await service.create(dto);
    expect(mockApi.post).toHaveBeenCalledWith('/curated-spots', dto);
    expect(spot).toEqual(sampleSpot);
  });

  it('patch calls PATCH /curated-spots/:id', async () => {
    mockApi.patch.mockResolvedValue({ data: sampleSpot });
    const body = { status: 'ACTIVE' as const };
    const spot = await service.patch('spot-1', body);
    expect(mockApi.patch).toHaveBeenCalledWith('/curated-spots/spot-1', body);
    expect(spot).toEqual(sampleSpot);
  });

  it('delete calls DELETE /curated-spots/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: { ...sampleSpot, isDeleted: true } });
    const spot = await service.delete('spot-1');
    expect(mockApi.delete).toHaveBeenCalledWith('/curated-spots/spot-1');
    expect(spot.isDeleted).toBe(true);
  });

  it('uploadImages posts FormData with images field', async () => {
    mockApi.post.mockResolvedValue({ data: { ...sampleSpot, imageUrls: ['https://x'] } });
    const f1 = new File(['a'], 'a.png', { type: 'image/png' });
    const f2 = new File(['b'], 'b.png', { type: 'image/png' });
    await service.uploadImages('spot-1', [f1, f2]);
    expect(mockApi.post).toHaveBeenCalledWith(
      '/curated-spots/spot-1/images',
      expect.any(FormData),
      { isFormData: true }
    );
    const fd = mockApi.post.mock.calls[0][1] as FormData;
    expect(fd.getAll('images')).toHaveLength(2);
  });

  it('uploadVideo posts FormData with file field', async () => {
    mockApi.post.mockResolvedValue({ data: sampleSpot });
    const vf = new File(['v'], 'v.mp4', { type: 'video/mp4' });
    await service.uploadVideo('spot-1', vf);
    expect(mockApi.post).toHaveBeenCalledWith('/curated-spots/spot-1/video', expect.any(FormData), {
      isFormData: true,
    });
    const fd = mockApi.post.mock.calls[0][1] as FormData;
    expect(fd.get('file')).toBe(vf);
  });

  it('getUserRatingsSettings calls GET /curated-spots/settings/user-ratings', async () => {
    const settings = {
      id: 'curated_spots_user_ratings_settings' as const,
      isEnabled: true,
      updatedAt: '2024-01-01T12:00:00.000Z',
    };
    mockApi.get.mockResolvedValue({ data: settings });
    const result = await service.getUserRatingsSettings();
    expect(mockApi.get).toHaveBeenCalledWith('/curated-spots/settings/user-ratings');
    expect(result).toEqual(settings);
  });

  it('patchUserRatingsSettings calls PATCH /curated-spots/settings/user-ratings', async () => {
    const settings = {
      id: 'curated_spots_user_ratings_settings' as const,
      isEnabled: false,
      updatedAt: '2024-01-02T12:00:00.000Z',
    };
    mockApi.patch.mockResolvedValue({ data: settings });
    const body = { isEnabled: false };
    const result = await service.patchUserRatingsSettings(body);
    expect(mockApi.patch).toHaveBeenCalledWith('/curated-spots/settings/user-ratings', body);
    expect(result).toEqual(settings);
  });
});
