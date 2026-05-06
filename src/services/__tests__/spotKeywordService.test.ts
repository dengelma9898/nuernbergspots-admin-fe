const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
};

jest.mock('../../lib/api', () => ({
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

jest.mock('../../lib/apiUtils', () => ({
  unwrapData: jest.fn((response: { data: unknown }) => response.data),
}));

import { useSpotKeywordService } from '../spotKeywordService';

describe('spotKeywordService', () => {
  let service: ReturnType<typeof useSpotKeywordService>;

  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('suggest calls GET with encoded q', async () => {
    mockApi.get.mockResolvedValue({ data: [kw] });
    const list = await service.suggest('bier', 15);
    expect(mockApi.get).toHaveBeenCalledWith('/spot-keywords/suggest?q=bier&limit=15');
    expect(list).toEqual([kw]);
  });

  it('create posts to /spot-keywords', async () => {
    mockApi.post.mockResolvedValue({ data: kw });
    const created = await service.create({ name: 'Biergarten' });
    expect(mockApi.post).toHaveBeenCalledWith('/spot-keywords', { name: 'Biergarten' });
    expect(created).toEqual(kw);
  });

  it('getById calls GET /spot-keywords/:id', async () => {
    mockApi.get.mockResolvedValue({ data: kw });
    const found = await service.getById('k1');
    expect(mockApi.get).toHaveBeenCalledWith('/spot-keywords/k1');
    expect(found).toEqual(kw);
  });
});
