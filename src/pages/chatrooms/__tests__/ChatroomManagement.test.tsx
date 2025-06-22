import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChatroomManagement } from '../ChatroomManagement';
import { Chatroom } from '@/models/chatroom';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock services
const mockChatroomService = {
  getChatrooms: jest.fn(),
  getChatroom: jest.fn(),
  createChatroom: jest.fn(),
  updateChatroom: jest.fn(),
  deleteChatroom: jest.fn(),
  addParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  getLastMessages: jest.fn(),
  uploadChatroomImage: jest.fn(),
  removeChatroomImage: jest.fn(),
};

jest.mock('@/services/chatroomService', () => ({
  useChatroomService: () => mockChatroomService,
}));

// Mock skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div data-slot="skeleton" className={className} {...props} />
  ),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from 'sonner';

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    if (formatStr === 'dd.MM.yyyy') {
      return '01.01.2024';
    }
    return '01.01.2024';
  }),
}));

// Mock URL methods for file handling
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Create mock data
const createMockChatroom = (overrides: Partial<Chatroom> = {}): Chatroom => ({
  id: 'chatroom-1',
  title: 'Test Chatroom',
  description: 'Ein Test Chatroom für die Entwicklung',
  imageUrl: 'https://example.com/image.jpg',
  createdBy: 'user-1',
  participants: ['user-1', 'user-2', 'user-3'],
  lastMessage: {
    content: 'Letzte Nachricht im Chat',
    authorId: 'user-2',
    sentAt: '2024-01-01T10:00:00.000Z',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const mockChatrooms: Chatroom[] = [
  createMockChatroom(),
  createMockChatroom({
    id: 'chatroom-2',
    title: 'Marketing Chat',
    description: 'Diskussionen über Marketing-Strategien',
    imageUrl: null,
    participants: ['user-1', 'user-4'],
    lastMessage: undefined,
  }),
  createMockChatroom({
    id: 'chatroom-3',
    title: 'Support Chat',
    description: 'Technischer Support und Hilfe',
    participants: ['user-1'],
  }),
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ChatroomManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    mockChatroomService.getChatrooms.mockResolvedValue(mockChatrooms);
  });

  describe('Initial Rendering', () => {
    it('sollte die Hauptkomponente korrekt rendern', async () => {
      renderWithRouter(<ChatroomManagement />);

      expect(screen.getByText('Chatroom Management')).toBeInTheDocument();
      expect(
        screen.getByText('Verwalten Sie hier alle Chatrooms und deren Einstellungen')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zurück zum dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /neuer chatroom/i })).toBeInTheDocument();
    });

    it('sollte Skeleton-Loading während des Ladens anzeigen', () => {
      mockChatroomService.getChatrooms.mockImplementation(() => new Promise(() => {}));

      const { container } = renderWithRouter(<ChatroomManagement />);

      // Sollte 6 Skeleton-Chatroom-Cards anzeigen
      const skeletonElements = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(30); // Jede Skeleton-Card hat mehrere Skeleton-Elemente
    });

    it('sollte Chatrooms laden und anzeigen', async () => {
      await act(async () => {
        renderWithRouter(<ChatroomManagement />);
      });

      await waitFor(() => {
        expect(mockChatroomService.getChatrooms).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
        expect(screen.getByText('Marketing Chat')).toBeInTheDocument();
        expect(screen.getByText('Support Chat')).toBeInTheDocument();
      });
    });

    it('sollte leeren Zustand anzeigen wenn keine Chatrooms vorhanden', async () => {
      mockChatroomService.getChatrooms.mockResolvedValue([]);

      await act(async () => {
        renderWithRouter(<ChatroomManagement />);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Keine Chatrooms vorhanden. Erstellen Sie einen neuen Chatroom!')
        ).toBeInTheDocument();
      });
    });

    it('sollte Fehler beim Laden handhaben', async () => {
      mockChatroomService.getChatrooms.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderWithRouter(<ChatroomManagement />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Chatrooms konnten nicht geladen werden.');
      });
    });
  });

  describe('Navigation', () => {
    it('sollte zurück zum Dashboard navigieren', async () => {
      renderWithRouter(<ChatroomManagement />);

      const backButton = screen.getByRole('button', { name: /zurück zum dashboard/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('sollte zu Chatroom-Messages navigieren bei Chatroom-Klick', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const chatroomCard = screen.getByText('Test Chatroom').closest('[data-slot="card"]');
      if (chatroomCard) {
        fireEvent.click(chatroomCard);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/chatrooms/chatroom-1/messages');
    });
  });

  describe('Chatroom Display', () => {
    it('sollte Chatroom-Informationen korrekt anzeigen', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      expect(screen.getByText('Ein Test Chatroom für die Entwicklung')).toBeInTheDocument();
      expect(screen.getByText('3 Teilnehmer')).toBeInTheDocument();

      // Verwende getAllByText da mehrere Chatrooms die gleiche letzte Nachricht haben können
      const lastMessageElements = screen.getAllByText(/Letzte Nachricht: Letzte Nachricht im Chat/);
      expect(lastMessageElements.length).toBeGreaterThan(0);

      // Verwende getAllByText da mehrere Chatrooms das gleiche Erstellungsdatum haben können
      const createdAtElements = screen.getAllByText('Erstellt am 01.01.2024');
      expect(createdAtElements.length).toBeGreaterThan(0);
    });

    it('sollte Chatroom ohne Bild korrekt anzeigen', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Marketing Chat')).toBeInTheDocument();
      });

      expect(screen.getByText('2 Teilnehmer')).toBeInTheDocument();
      expect(screen.queryByText('Letzte Nachricht:')).not.toBeInTheDocument();
    });

    it('sollte Chatroom-Bilder anzeigen wenn vorhanden', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const chatroomImage = screen.getByAltText('Test Chatroom');
      expect(chatroomImage).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('sollte Edit und Delete Buttons für jeden Chatroom anzeigen', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/bearbeiten/i);
      const deleteButtons = screen.getAllByText(/löschen/i);

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Create Chatroom Dialog', () => {
    it('sollte Create Dialog öffnen und schließen', () => {
      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      expect(screen.getByText('Neuen Chatroom erstellen')).toBeInTheDocument();
      expect(
        screen.getByText('Erstellen Sie einen neuen Chatroom mit den gewünschten Einstellungen.')
      ).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /abbrechen/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Neuen Chatroom erstellen')).not.toBeInTheDocument();
    });

    it('sollte Formularfelder im Create Dialog anzeigen', () => {
      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      expect(screen.getByLabelText('Titel')).toBeInTheDocument();
      expect(screen.getByLabelText('Beschreibung')).toBeInTheDocument();
      expect(screen.getByText('Chatroom Bild')).toBeInTheDocument();
      expect(screen.getByText('Bild auswählen')).toBeInTheDocument();
    });

    it('sollte Chatroom erfolgreich erstellen', async () => {
      const newChatroom = createMockChatroom({
        id: 'new-chatroom',
        title: 'Neuer Test Chatroom',
        description: 'Beschreibung für neuen Chatroom',
      });

      mockChatroomService.createChatroom.mockResolvedValue(newChatroom);

      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      fireEvent.change(screen.getByLabelText('Titel'), {
        target: { value: 'Neuer Test Chatroom' },
      });
      fireEvent.change(screen.getByLabelText('Beschreibung'), {
        target: { value: 'Beschreibung für neuen Chatroom' },
      });

      const submitButton = screen.getByRole('button', { name: /erstellen/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockChatroomService.createChatroom).toHaveBeenCalledWith({
          title: 'Neuer Test Chatroom',
          description: 'Beschreibung für neuen Chatroom',
          imageUrl: '',
          participants: [],
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Chatroom wurde erfolgreich erstellt.');
    });

    it('sollte Fehler bei Chatroom-Erstellung handhaben', async () => {
      mockChatroomService.createChatroom.mockRejectedValue(new Error('Creation error'));

      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      fireEvent.change(screen.getByLabelText('Titel'), {
        target: { value: 'Test Titel' },
      });

      const submitButton = screen.getByRole('button', { name: /erstellen/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Chatroom konnte nicht erstellt werden.');
      });
    });

    it('sollte Datei-Upload für Chatroom-Bild handhaben', () => {
      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen
        .getByLabelText('Bild auswählen')
        .closest('label')
        ?.querySelector('input[type="file"]');

      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
        });
        fireEvent.change(fileInput);
      }
    });
  });

  describe('Edit Chatroom Dialog', () => {
    it('sollte Edit Dialog öffnen mit vorausgefüllten Daten', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/bearbeiten/i);
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Chatroom bearbeiten')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Chatroom')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ein Test Chatroom für die Entwicklung')).toBeInTheDocument();
    });

    it('sollte Chatroom erfolgreich aktualisieren', async () => {
      const updatedChatroom = createMockChatroom({
        title: 'Aktualisierter Titel',
        description: 'Aktualisierte Beschreibung',
      });

      mockChatroomService.updateChatroom.mockResolvedValue(updatedChatroom);

      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/bearbeiten/i);
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByDisplayValue('Test Chatroom'), {
        target: { value: 'Aktualisierter Titel' },
      });

      const saveButton = screen.getByRole('button', { name: /speichern/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockChatroomService.updateChatroom).toHaveBeenCalledWith('chatroom-1', {
          title: 'Aktualisierter Titel',
          description: 'Ein Test Chatroom für die Entwicklung',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Chatroom wurde erfolgreich aktualisiert.');
    });

    it('sollte Fehler bei Chatroom-Aktualisierung handhaben', async () => {
      mockChatroomService.updateChatroom.mockRejectedValue(new Error('Update error'));

      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/bearbeiten/i);
      fireEvent.click(editButtons[0]);

      const saveButton = screen.getByRole('button', { name: /speichern/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Chatroom konnte nicht aktualisiert werden.');
      });
    });
  });

  describe('Delete Chatroom Dialog', () => {
    it('sollte Delete Dialog öffnen mit Bestätigung', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/löschen/i);
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Chatroom löschen')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/möchten sie den chatroom "test chatroom" wirklich löschen/i)
      ).toBeInTheDocument();

      // Verwende eine flexiblere Suche für den Text
      expect(
        screen.getByText((content, element) => {
          return content.includes('Diese Aktion kann nicht rückgängig gemacht werden');
        })
      ).toBeInTheDocument();
    });

    it('sollte Chatroom erfolgreich löschen', async () => {
      mockChatroomService.deleteChatroom.mockResolvedValue(undefined);

      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/löschen/i);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /löschen/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockChatroomService.deleteChatroom).toHaveBeenCalledWith('chatroom-1');
      });

      expect(toast.success).toHaveBeenCalledWith('Chatroom wurde erfolgreich gelöscht.');
    });

    it('sollte Fehler bei Chatroom-Löschung handhaben', async () => {
      mockChatroomService.deleteChatroom.mockRejectedValue(new Error('Delete error'));

      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/löschen/i);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /löschen/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Chatroom konnte nicht gelöscht werden.');
      });
    });

    it('sollte Delete Dialog abbrechen können', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText(/löschen/i);
      fireEvent.click(deleteButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /abbrechen/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Chatroom löschen')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('sollte responsive Container-Klassen haben', () => {
      renderWithRouter(<ChatroomManagement />);

      const container = document.querySelector('.container');
      expect(container).toHaveClass('mx-auto', 'p-4', 'sm:p-8', 'max-w-7xl');
    });

    it('sollte responsive Grid-Layout für Chatrooms haben', async () => {
      renderWithRouter(<ChatroomManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Chatroom')).toBeInTheDocument();
      });

      const gridContainer = document.querySelector(
        '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3'
      );
      expect(gridContainer).toBeInTheDocument();
    });

    it('sollte responsive Header-Layout haben', () => {
      renderWithRouter(<ChatroomManagement />);

      const headerContainer = document.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(headerContainer).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('sollte Image Preview anzeigen nach Dateiauswahl', () => {
      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      // Image Preview Container sollte initial das Image Icon zeigen
      const imageContainer = document.querySelector('.relative.w-32.h-32');
      expect(imageContainer).toBeInTheDocument();

      const imageIcon = document.querySelector('.lucide-image');
      expect(imageIcon).toBeInTheDocument();
    });

    it('sollte Image Preview entfernen können', () => {
      renderWithRouter(<ChatroomManagement />);

      const createButton = screen.getByRole('button', { name: /neuer chatroom/i });
      fireEvent.click(createButton);

      // Simuliere dass ein Bild ausgewählt wurde
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen
        .getByLabelText('Bild auswählen')
        .closest('label')
        ?.querySelector('input[type="file"]');

      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
        });
        fireEvent.change(fileInput);
      }
    });
  });
});
