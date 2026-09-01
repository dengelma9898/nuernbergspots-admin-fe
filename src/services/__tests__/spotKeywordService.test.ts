const mockApi = {
  getData: vi.fn(),
  postData: vi.fn(),
  patchData: vi.fn(),
  putData: vi.fn(),
  deleteData: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock('../../lib/api', () => ({
  useApi: () => mockApi,
  endpoints: {
    spotKeywords: '/spot-keywords',
    spotKeywordById: (id: string) => `/spot-keywords/${encodeURIComponent(id)}`,
    spotKeywordsSuggest: (q: string, limit?: number) => {
      const p = new URLSearchParams({ q });
      if (limit != null) p.set('limit', String(limit));
      return `/spot-keywords/suggest?${p.toString()}`;
    },
  },
}));

import { useSpotKeywordService } from '../spotKeywordService';

describe('spotKeywordService', () => {
  let service: ReturnType<typeof useSpotKeywordService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = useSpotKeywordService();
  });

  const kw = {
    id: 'k1',
    name: 'Biergarten',
    nameLower: 'biergarten',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('suggest returns [] for blank query without calling API', async () => {
    const r = await service.suggest('   ');
    expect(r).toEqual([]);
    expect(mockApi.getData).not.toHaveBeenCalled();
  });

  it('suggest calls GET with encoded q', async () => {
    mockApi.getData.mockResolvedValue([kw]);
    const list = await service.suggest('bier', 15);
    expect(mockApi.getData).toHaveBeenCalledWith('/spot-keywords/suggest?q=bier&limit=15');
    expect(list).toEqual([kw]);
  });

  it('create posts to /spot-keywords', async () => {
    mockApi.postData.mockResolvedValue(kw);
    const created = await service.create({ name: 'Biergarten' });
    expect(mockApi.postData).toHaveBeenCalledWith('/spot-keywords', { name: 'Biergarten' });
    expect(created).toEqual(kw);
  });

  it('getById calls GET /spot-keywords/:id', async () => {
    mockApi.getData.mockResolvedValue(kw);
    const found = await service.getById('k1');
    expect(mockApi.getData).toHaveBeenCalledWith('/spot-keywords/k1');
    expect(found).toEqual(kw);
  });
});
