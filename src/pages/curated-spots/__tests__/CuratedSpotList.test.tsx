import { render, screen, waitFor } from '@testing-library/react';
import { CuratedSpotList } from '../CuratedSpotList';

const mockNavigate = vi.fn();
const mockListAdmin = vi.fn();
const mockGetUserProfile = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/curatedSpotService', () => ({
  useCuratedSpotService: () => ({
    listAdmin: mockListAdmin,
  }),
}));

vi.mock('@/services/userService', () => ({
  useUserService: () => ({
    getUserProfile: mockGetUserProfile,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getUserId: () => 'admin-id',
  }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@/utils/errorUtils', () => ({
  showUserFriendlyError: vi.fn(),
  showSuccessMessage: vi.fn(),
}));

describe('CuratedSpotList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserProfile.mockResolvedValue({ userType: 'admin' });
  });

  it('renders title and spots after load', async () => {
    mockListAdmin.mockResolvedValue([
      {
        id: 's1',
        name: 'Test-Spot',
        nameLower: 'test-spot',
        descriptionMarkdown: 'Beschreibung',
        imageUrls: [],
        keywordIds: ['k1'],
        address: {
          street: 'Hauptstraße',
          houseNumber: '10',
          postalCode: '90403',
          city: 'Nürnberg',
          latitude: 49.448,
          longitude: 11.079,
        },
        videoUrl: null,
        instagramUrl: null,
        status: 'PENDING',
        isDeleted: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdByUserId: null,
      },
    ]);

    render(<CuratedSpotList />);

    expect(screen.getByRole('heading', { name: /Kuratierte Spots/i })).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Test-Spot')).toBeTruthy();
    });
    expect(screen.getByText('Ausstehend')).toBeTruthy();
  });

  it('shows empty state when no spots', async () => {
    mockListAdmin.mockResolvedValue([]);

    render(<CuratedSpotList />);

    await waitFor(() => {
      expect(screen.getByText('Keine Spots')).toBeTruthy();
    });
  });
});
