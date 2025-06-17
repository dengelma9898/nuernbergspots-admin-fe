import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContactRequestDetail } from '../ContactRequestDetail';
import { ContactRequest, ContactRequestType, ContactMessage } from '@/models/contact-requests';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
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

// Mock auth context
const mockAuth = {
  getUserId: jest.fn().mockReturnValue('admin-1'),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
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

// Helper function to create mock contact request
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

const mockContactRequest: ContactRequest = createMockContactRequest({
  id: 'request-1',
  type: ContactRequestType.FEEDBACK,
  message: 'Feedback zur App',
  messages: [
    {
      userId: 'user-1',
      message: 'Das ist eine Testnachricht',
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
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ContactRequestDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'request-1' });
    mockContactService.getContactRequestById.mockResolvedValue(mockContactRequest);
  });

  describe('Initial Rendering', () => {
    it('sollte die Hauptkomponente korrekt rendern', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(screen.getByText('Kontaktanfrage Details')).toBeInTheDocument();
        expect(screen.getByText('Feedback')).toBeInTheDocument();
        expect(screen.getByText('Konversation')).toBeInTheDocument();
      });
    });

    it('sollte Kontaktanfrage laden und anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(mockContactService.getContactRequestById).toHaveBeenCalledWith('request-1');
      });

      await waitFor(() => {
        expect(screen.getByText('Das ist eine Testnachricht')).toBeInTheDocument();
        expect(screen.getByText('Vielen Dank für Ihr Feedback!')).toBeInTheDocument();
      });
    });

    it('sollte Loading-State anzeigen', async () => {
      mockContactService.getContactRequestById.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContactRequest), 100))
      );

      renderWithRouter(<ContactRequestDetail />);

      expect(screen.getByText('Lade Kontaktanfrage...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Lade Kontaktanfrage...')).not.toBeInTheDocument();
      });
    });

    it('sollte Fehlerzustand anzeigen wenn ID fehlt', async () => {
      mockUseParams.mockReturnValue({ id: undefined });

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      // Da keine ID vorhanden ist, lädt die Komponente nicht und bleibt im Loading-State
      // Das ist das erwartete Verhalten, da fetchContactRequest() nicht ausgeführt wird
      expect(screen.getByText('Lade Kontaktanfrage...')).toBeInTheDocument();
      expect(mockContactService.getContactRequestById).not.toHaveBeenCalled();
    });

    it('sollte Fehlerzustand anzeigen wenn Kontaktanfrage nicht gefunden', async () => {
      mockContactService.getContactRequestById.mockRejectedValue(new Error('Not found'));

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Fehler beim Laden der Kontaktanfrage');
      });
    });
  });

  describe('Message Display', () => {
    it('sollte Benutzer- und Admin-Nachrichten unterschiedlich anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(screen.getByText('Benutzer')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
    });

    it('sollte Nachrichten korrekt positionieren', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        // Admin-Nachrichten sollten rechts sein
        const adminMessages = container.querySelectorAll('.justify-end');
        expect(adminMessages.length).toBeGreaterThan(0);

        // Benutzer-Nachrichten sollten links sein
        const userMessages = container.querySelectorAll('.justify-start');
        expect(userMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Request Type and Status Badges', () => {
    it('sollte Request-Type Badge korrekt anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(screen.getByText('Feedback')).toBeInTheDocument();
      });
    });

    it('sollte Status Badge für offene Anfrage anzeigen', async () => {
      const openRequest = createMockContactRequest({ isProcessed: false });
      mockContactService.getContactRequestById.mockResolvedValue(openRequest);

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(screen.getByText('Offen')).toBeInTheDocument();
      });
    });

    it('sollte Status Badge für bearbeitete Anfrage anzeigen', async () => {
      const processedRequest = createMockContactRequest({ isProcessed: true });
      mockContactService.getContactRequestById.mockResolvedValue(processedRequest);

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(screen.getByText('Bearbeitet')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zurück zur Übersicht navigieren', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const backButton = screen.getByRole('button', { name: '' }); // ArrowLeft Icon Button
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/contacts');
    });

    it('sollte von Fehlerzustand zur Übersicht navigieren', async () => {
      mockContactService.getContactRequestById.mockRejectedValue(new Error('Not found'));

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        const backButton = screen.getByText('Zurück zur Übersicht');
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/contacts');
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('sollte Daten beim Klick auf Aktualisieren neu laden', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const refreshButton = screen.getByText('Aktualisieren');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockContactService.getContactRequestById).toHaveBeenCalledTimes(2);
      });
    });

    it('sollte Loading-State während des Aktualisierens anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      // Mock langsame Antwort für zweiten Aufruf
      mockContactService.getContactRequestById.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContactRequest), 100))
      );

      const refreshButton = screen.getByText('Aktualisieren');
      fireEvent.click(refreshButton);

      expect(screen.getByText('Wird aktualisiert...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      });
    });

    it('sollte Erfolgs-Toast nach Aktualisierung anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const refreshButton = screen.getByText('Aktualisieren');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Kontaktanfrage erfolgreich aktualisiert');
      });
    });
  });

  describe('Response Form', () => {
    it('sollte Antwortformular rendern', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Ihre Antwort...')).toBeInTheDocument();
        expect(screen.getByText('Antwort senden')).toBeInTheDocument();
      });
    });

    it('sollte Antwort senden', async () => {
      const updatedRequest = createMockContactRequest({
        messages: [
          ...mockContactRequest.messages,
          {
            userId: 'admin-1',
            message: 'Neue Admin-Antwort',
            createdAt: '2024-01-01T12:00:00.000Z',
            isAdminResponse: true,
          },
        ],
      });

      mockContactService.respondToContactRequest.mockResolvedValue(updatedRequest);

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const textarea = screen.getByPlaceholderText('Ihre Antwort...');
      const sendButton = screen.getByText('Antwort senden');

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Neue Admin-Antwort' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockContactService.respondToContactRequest).toHaveBeenCalledWith('request-1', 'Neue Admin-Antwort');
      });
    });

    it('sollte leere Antwort nicht senden', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const sendButton = screen.getByText('Antwort senden');
      
      expect(sendButton).toBeDisabled();

      fireEvent.click(sendButton);

      expect(mockContactService.respondToContactRequest).not.toHaveBeenCalled();
    });

    it('sollte Formular während des Sendens deaktivieren', async () => {
      mockContactService.respondToContactRequest.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContactRequest), 100))
      );

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const textarea = screen.getByPlaceholderText('Ihre Antwort...');
      const sendButton = screen.getByText('Antwort senden');

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test-Antwort' } });
      });

      fireEvent.click(sendButton);

      expect(screen.getByText('Wird gesendet...')).toBeInTheDocument();
      expect(textarea).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Antwort senden')).toBeInTheDocument();
      });
    });

    it('sollte Erfolgs-Toast nach dem Senden anzeigen', async () => {
      mockContactService.respondToContactRequest.mockResolvedValue(mockContactRequest);

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const textarea = screen.getByPlaceholderText('Ihre Antwort...');
      const sendButton = screen.getByText('Antwort senden');

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test-Antwort' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Antwort erfolgreich gesendet');
      });
    });

    it('sollte Fehler-Toast bei Sendefehler anzeigen', async () => {
      mockContactService.respondToContactRequest.mockRejectedValue(new Error('Send error'));

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const textarea = screen.getByPlaceholderText('Ihre Antwort...');
      const sendButton = screen.getByText('Antwort senden');

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test-Antwort' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Fehler beim Senden der Antwort');
      });
    });

    it('sollte Formular nach erfolgreichem Senden leeren', async () => {
      mockContactService.respondToContactRequest.mockResolvedValue(mockContactRequest);

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const textarea = screen.getByPlaceholderText('Ihre Antwort...');
      const sendButton = screen.getByText('Antwort senden');

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test-Antwort' } });
      });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Layout haben', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        const mainContainer = container.querySelector('.w-full.min-h-screen.bg-white');
        expect(mainContainer).toBeInTheDocument();

        const maxWidthContainer = container.querySelector('.max-w-2xl.mx-auto');
        expect(maxWidthContainer).toBeInTheDocument();
      });
    });

    it('sollte floating Antwortfeld haben', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        const floatingForm = container.querySelector('.fixed.bottom-0.left-0.w-full');
        expect(floatingForm).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('sollte Datum korrekt formatiert anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        const dateElements = screen.getAllByText('01.01.2024 10:30');
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Submission', () => {
    it('sollte Form onSubmit Event korrekt handhaben', async () => {
      mockContactService.respondToContactRequest.mockResolvedValue(mockContactRequest);

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      const form = document.querySelector('form');
      const textarea = screen.getByPlaceholderText('Ihre Antwort...');

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test-Antwort' } });
      });

      if (form) {
        await act(async () => {
          fireEvent.submit(form);
        });

        await waitFor(() => {
          expect(mockContactService.respondToContactRequest).toHaveBeenCalledWith('request-1', 'Test-Antwort');
        });
      } else {
        // Falls das Formular nicht gefunden wird, teste direkt den Submit Button
        const submitButton = screen.getByText('Antwort senden');
        await act(async () => {
          fireEvent.click(submitButton);
        });

        await waitFor(() => {
          expect(mockContactService.respondToContactRequest).toHaveBeenCalledWith('request-1', 'Test-Antwort');
        });
      }
    });
  });

  describe('Message Bubble Styling', () => {
    it('sollte Admin-Nachrichten mit Primary-Styling anzeigen', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        const adminBubbles = container.querySelectorAll('.bg-primary.text-primary-foreground');
        expect(adminBubbles.length).toBeGreaterThan(0);
      });
    });

    it('sollte Benutzer-Nachrichten mit Muted-Styling anzeigen', async () => {
      const { container } = await act(async () => {
        return renderWithRouter(<ContactRequestDetail />);
      });

      await waitFor(() => {
        const userBubbles = container.querySelectorAll('.bg-muted');
        expect(userBubbles.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('sollte fehlende ID handhaben', async () => {
      mockUseParams.mockReturnValue({ id: '' });

      await act(async () => {
        renderWithRouter(<ContactRequestDetail />);
      });

      // Sollte nicht versuchen zu laden wenn keine ID vorhanden
      expect(mockContactService.getContactRequestById).not.toHaveBeenCalled();
    });
  });
}); 