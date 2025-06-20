import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContactRequests } from '../ContactRequests';
import { ContactRequest, ContactRequestType } from '@/models/contact-requests';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock services
const mockContactService = {
  getContactRequests: jest.fn(),
  getContactRequestById: jest.fn(),
  respondToContactRequest: jest.fn(),
  getOpenContactRequestsCount: jest.fn(),
};

jest.mock('@/services/contactService', () => ({
  useContactService: () => mockContactService,
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast: mockToast } = require('sonner');

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01.01.2024 10:30'),
}));

jest.mock('date-fns/locale', () => ({
  de: {},
}));

// Helper function to create mock contact requests
const createMockContactRequest = (overrides: Partial<ContactRequest> = {}): ContactRequest => ({
  id: 'request-1',
  type: ContactRequestType.GENERAL,
  message: 'Test-Kontaktanfrage',
  userId: 'user-1',
  messages: [
    {
      userId: 'user-1',
      message: 'Das ist eine Testnachricht',
      createdAt: '2024-01-01T10:30:00.000Z',
      isAdminResponse: false,
    },
  ],
  createdAt: '2024-01-01T10:30:00.000Z',
  updatedAt: '2024-01-01T10:30:00.000Z',
  isProcessed: false,
  responded: false,
  ...overrides,
});

const mockContactRequests: ContactRequest[] = [
  createMockContactRequest({
    id: 'request-1',
    type: ContactRequestType.GENERAL,
    message: 'Allgemeine Anfrage',
    isProcessed: false,
  }),
  createMockContactRequest({
    id: 'request-2',
    type: ContactRequestType.FEEDBACK,
    message: 'Feedback zur App',
    isProcessed: true,
    messages: [
      {
        userId: 'user-2',
        message: 'Feedback zur App',
        createdAt: '2024-01-01T10:30:00.000Z',
        isAdminResponse: false,
      },
      {
        userId: 'admin-1',
        message: 'Vielen Dank für Ihr Feedback!',
        createdAt: '2024-01-01T11:00:00.000Z',
        isAdminResponse: true,
      },
    ],
  }),
  createMockContactRequest({
    id: 'request-3',
    type: ContactRequestType.BUSINESS_CLAIM,
    message: 'Ich möchte mein Geschäft beanspruchen',
    isProcessed: false,
  }),
  createMockContactRequest({
    id: 'request-4',
    type: ContactRequestType.BUSINESS_REQUEST,
    message: 'Neue Geschäftsanfrage',
    isProcessed: true,
  }),
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ContactRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContactService.getContactRequests.mockResolvedValue(mockContactRequests);
  });

  describe('Initial Rendering', () => {
    it('sollte die Hauptkomponente korrekt rendern', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      expect(screen.getByText('Kontaktanfragen')).toBeInTheDocument();
      expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      expect(screen.getByText('Zurück zum Dashboard')).toBeInTheDocument();
    });

    it('sollte Kontaktanfragen laden und anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        expect(mockContactService.getContactRequests).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Allgemeine Anfrage')).toBeInTheDocument();
        expect(screen.getByText('Feedback zur App')).toBeInTheDocument();
        expect(screen.getByText('Ich möchte mein Geschäft beanspruchen')).toBeInTheDocument();
        expect(screen.getByText('Neue Geschäftsanfrage')).toBeInTheDocument();
      });
    });

    it('sollte leeren Zustand anzeigen wenn keine Kontaktanfragen vorhanden', async () => {
      mockContactService.getContactRequests.mockResolvedValue([]);

      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        expect(screen.getByText('Keine Kontaktanfragen')).toBeInTheDocument();
        expect(screen.getByText('Es gibt aktuell keine offenen Kontaktanfragen.')).toBeInTheDocument();
      });
    });

    it('sollte Fehler beim Laden handhaben', async () => {
      mockContactService.getContactRequests.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Fehler beim Laden der Kontaktanfragen');
      });
    });
  });

  describe('Request Type Badges', () => {
    it('sollte korrekte Badges für verschiedene Anfragetypen anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        expect(screen.getByText('Allgemein')).toBeInTheDocument();
        expect(screen.getByText('Feedback')).toBeInTheDocument();
        expect(screen.getByText('Geschäft beanspruchen')).toBeInTheDocument();
        expect(screen.getByText('Geschäftsanfrage')).toBeInTheDocument();
      });
    });
  });

  describe('Status Badges', () => {
    it('sollte Status-Badges korrekt anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        // Prüfe auf Status-Badges
        const openBadges = screen.getAllByText('Offen');
        const processedBadges = screen.getAllByText('Bearbeitet');
        
        expect(openBadges.length).toBeGreaterThan(0);
        expect(processedBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zur Kontaktanfrage-Detailseite navigieren', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        expect(screen.getByText('Allgemeine Anfrage')).toBeInTheDocument();
      });

      const detailButtons = screen.getAllByText('Details anzeigen');
      fireEvent.click(detailButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/contacts/request-1');
    });

    it('sollte zum Dashboard navigieren', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      const dashboardButton = screen.getByText('Zurück zum Dashboard');
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Refresh Functionality', () => {
    it('sollte Daten beim Klick auf Aktualisieren neu laden', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      const refreshButton = screen.getByText('Aktualisieren');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockContactService.getContactRequests).toHaveBeenCalledTimes(2);
      });
    });

    it('sollte Loading-State während des Aktualisierens anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      // Mock langsame Antwort für den zweiten Aufruf
      mockContactService.getContactRequests.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContactRequests), 100))
      );

      const refreshButton = screen.getByText('Aktualisieren');
      fireEvent.click(refreshButton);

      // Prüfe Loading State
      expect(screen.getByText('Wird aktualisiert...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      });
    });
  });

  describe('Message Count Display', () => {
    it('sollte Nachrichtenanzahl korrekt anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        // Verwende getAllByText da mehrere Kontaktanfragen die gleiche Nachrichtenanzahl haben können
        const singleMessages = screen.getAllByText('1 Nachricht');
        expect(singleMessages.length).toBeGreaterThan(0);
        
        const multiMessages = screen.getAllByText('2 Nachrichten');
        expect(multiMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Date Formatting', () => {
    it('sollte Datum korrekt formatiert anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        const dateElements = screen.getAllByText('01.01.2024 10:30');
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Container-Klassen haben', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequests />);
      });

      const mainContainer = container.querySelector('.w-full.min-h-screen.bg-white.p-4.md\\:p-8');
      expect(mainContainer).toBeInTheDocument();

      const contentContainer = container.querySelector('.max-w-2xl.mx-auto');
      expect(contentContainer).toBeInTheDocument();
    });

    it('sollte responsive Button-Layout haben', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      const refreshButton = screen.getByText('Aktualisieren');
      expect(refreshButton.closest('button')).toHaveClass('w-full', 'sm:w-auto');

      const dashboardButton = screen.getByText('Zurück zum Dashboard');
      expect(dashboardButton.closest('button')).toHaveClass('w-full', 'sm:w-auto');
    });
  });

  describe('Card Interaction', () => {
    it('sollte Hover-Effekte für Karten haben', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        const cards = container.querySelectorAll('.hover\\:bg-accent\\/40');
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('sollte korrekte ARIA-Labels und Strukturen haben', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      // Prüfe Hauptüberschrift
      const heading = screen.getByRole('heading', { name: /kontaktanfragen/i });
      expect(heading).toBeInTheDocument();

      // Prüfe Buttons
      const refreshButton = screen.getByRole('button', { name: /aktualisieren/i });
      expect(refreshButton).toBeInTheDocument();

      const dashboardButton = screen.getByRole('button', { name: /zurück zum dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('sollte Toast-Erfolg bei manuellem Refresh anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      // Warte bis initiale Ladung abgeschlossen ist
      await waitFor(() => {
        expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Aktualisieren');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Kontaktanfragen erfolgreich aktualisiert');
      });
    });

    it('sollte Toast-Fehler bei Netzwerkproblemen anzeigen', async () => {
      mockContactService.getContactRequests.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderWithRouter(<ContactRequests />);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Fehler beim Laden der Kontaktanfragen');
      });
    });
  });

  describe('Loading States', () => {
    it('sollte initialen Loading-State mit Skeleton-Elementen anzeigen', async () => {
      mockContactService.getContactRequests.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContactRequests), 100))
      );

      const { container } = renderWithRouter(<ContactRequests />);

      // Prüfe dass Skeleton-Elemente während des Ladens angezeigt werden
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);

      // Prüfe dass mehrere Skeleton-Karten mit dem richtigen Glassmorphism-Styling angezeigt werden
      const skeletonCards = container.querySelectorAll('.backdrop-blur-3xl.bg-gradient-to-br.from-white\\/15.to-white\\/5');
      expect(skeletonCards.length).toBeGreaterThanOrEqual(3); // Mindestens 3 Skeleton-Karten

      await waitFor(() => {
        // Nach dem Laden sollten die echten Kontaktanfragen angezeigt werden
        expect(screen.getByText('Allgemeine Anfrage')).toBeInTheDocument();
      });

      // Skeleton-Elemente sollten verschwunden sein
      await waitFor(() => {
        const remainingSkeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(remainingSkeletons.length).toBe(0);
      });
    });
  });
}); 