import { render, screen, waitFor } from '@testing-library/react';
import { CuratedSpotList } from '../CuratedSpotList';

const mockNavigate = jest.fn();
const mockListAdmin = jest.fn();
const mockGetUserProfile = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('@/services/curatedSpotService', () => ({
  useCuratedSpotService: () => ({
    listAdmin: mockListAdmin,
  }),
}));

jest.mock('@/services/userService', () => ({
  useUserService: () => ({
    getUserProfile: mockGetUserProfile,
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getUserId: () => 'admin-id',
  }),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('@/utils/errorUtils', () => ({
  showUserFriendlyError: jest.fn(),
  showSuccessMessage: jest.fn(),
}));

describe('CuratedSpotList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  it('shows empty state when no spots', async () => {
    mockListAdmin.mockResolvedValue([]);

    render(<CuratedSpotList />);

    await waitFor(() => {
      expect(screen.getByText('Keine Spots')).toBeTruthy();
    });
  });
});
