import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CsvEventImport } from '../CsvEventImport';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { parseCsvFile, buildCsvFile } from '@/utils/csvEventParser';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock('@/services/eventService');
vi.mock('@/services/eventCategoryService');
vi.mock('@/utils/csvEventParser', async () => ({
  ...(await vi.importActual('@/utils/csvEventParser')),
  parseCsvFile: vi.fn(),
  buildCsvFile: vi.fn(),
}));

vi.mock('sonner', async () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/utils/errorUtils', async () => ({
  showUserFriendlyError: vi.fn(),
}));

vi.mock('@/components/motion', async () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/components/LoadingButton', async () => ({
  LoadingButton: ({ children, onClick, disabled, isLoading }: any) => (
    <button onClick={onClick} disabled={disabled || isLoading}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/switch', async () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input
      id={id}
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={e => onCheckedChange(e.target.checked)}
    />
  ),
}));

const CSV_HEADER =
  'Titel,Beschreibung,Startdatum,Enddatum,Startzeit,Endzeit,Veranstaltungsort,Kategorien,Preis,Tickets,E-Mail,Telefon,Webseite,Social Media,Bild-URL,Detail-URL';

const mockEventService = {
  importEventsFromCsv: vi.fn(),
  getEvent: vi.fn(),
};

const mockEventCategoryService = {
  getCategories: vi.fn(),
};

const createCsvFile = (): File =>
  new File([`${CSV_HEADER}\nTest Event,Beschreibung,2026-01-01,,,,,,,,,,,,`], 'events.csv', {
    type: 'text/csv',
  });

const renderPage = () =>
  render(
    <BrowserRouter>
      <CsvEventImport />
    </BrowserRouter>
  );

describe('CsvEventImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useEventService as Mock).mockReturnValue(mockEventService);
    (useEventCategoryService as Mock).mockReturnValue(mockEventCategoryService);
    mockEventCategoryService.getCategories.mockResolvedValue([]);
    (parseCsvFile as Mock).mockResolvedValue([
      {
        rowIndex: 1,
        data: {
          Titel: 'Test Event',
          Beschreibung: 'Beschreibung',
          Startdatum: '2026-01-01',
          Enddatum: '',
          Startzeit: '',
          Endzeit: '',
          Veranstaltungsort: '',
          Kategorien: '',
          Preis: '',
          Tickets: '',
          'E-Mail': '',
          Telefon: '',
          Webseite: '',
          'Social Media': '',
          'Bild-URL': '',
          'Detail-URL': '',
        },
      },
    ]);
    (buildCsvFile as Mock).mockImplementation(
      (rows: unknown[], name: string) =>
        new File(['filtered'], `${name}-auswahl.csv`, { type: 'text/csv' })
    );
  });

  it('rendert Upload-Bereich und Vorschau-Toggle', () => {
    renderPage();
    expect(screen.getByText('CSV Event Import')).toBeInTheDocument();
    expect(screen.getByLabelText('Vorschau vor Import')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Events importieren/i })).toBeDisabled();
  });

  it('importiert direkt ohne Vorschau', async () => {
    mockEventService.importEventsFromCsv.mockResolvedValue({
      totalRows: 1,
      successful: 1,
      failed: 0,
      skipped: 0,
      results: [{ rowIndex: 1, success: true, eventId: 'event-1', errors: [] }],
    });
    mockEventService.getEvent.mockResolvedValue({
      id: 'event-1',
      title: 'Test Event',
      description: 'Beschreibung',
      location: { address: 'Ort', latitude: 0, longitude: 0 },
      dailyTimeSlots: [{ date: '2026-01-01' }],
      createdAt: '',
      updatedAt: '',
    });

    renderPage();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createCsvFile();
    fireEvent.change(input, { target: { files: [file] } });

    const importButton = await screen.findByRole('button', { name: /Events importieren/i });
    await waitFor(() => expect(importButton).not.toBeDisabled());

    fireEvent.click(importButton);

    await waitFor(() => {
      expect(mockEventService.importEventsFromCsv).toHaveBeenCalledWith(file);
    });

    expect(await screen.findByText('Import-Ergebnis')).toBeInTheDocument();
    expect(screen.getAllByText('Test Event').length).toBeGreaterThan(0);
  });

  it('zeigt Vorschau und importiert nur ausgewählte Zeilen', async () => {
    mockEventService.importEventsFromCsv.mockResolvedValue({
      totalRows: 1,
      successful: 1,
      failed: 0,
      skipped: 0,
      results: [{ rowIndex: 1, success: true, eventId: 'event-1', errors: [] }],
    });
    mockEventService.getEvent.mockResolvedValue({
      id: 'event-1',
      title: 'Test Event',
      description: 'Beschreibung',
      location: { address: 'Ort', latitude: 0, longitude: 0 },
      dailyTimeSlots: [{ date: '2026-01-01' }],
      createdAt: '',
      updatedAt: '',
    });

    renderPage();
    fireEvent.click(screen.getByLabelText('Vorschau vor Import'));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createCsvFile()] } });

    await waitFor(() => {
      expect(parseCsvFile).toHaveBeenCalled();
      expect(screen.getByText(/1 von 1 Events ausgewählt/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /1 Event importieren/i }));

    await waitFor(() => {
      expect(buildCsvFile).toHaveBeenCalled();
      expect(mockEventService.importEventsFromCsv).toHaveBeenCalled();
      expect(screen.getByText('Import-Ergebnis')).toBeInTheDocument();
    });
  });

  it('lädt Vorschau nach Aktivieren des Toggles bei bereits gewählter Datei', async () => {
    renderPage();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createCsvFile()] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Events importieren/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByLabelText('Vorschau vor Import'));

    await waitFor(() => {
      expect(parseCsvFile).toHaveBeenCalled();
      expect(screen.getByText(/1 von 1 Events ausgewählt/)).toBeInTheDocument();
    });
  });

  it('erlaubt Abwahl von Zeilen in der Vorschau', async () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('Vorschau vor Import'));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createCsvFile()] } });

    await waitFor(() => {
      expect(screen.getByText(/1 von 1 Events ausgewählt/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Alle abwählen/i }));

    await waitFor(() => {
      expect(screen.getByText(/0 von 1 Events ausgewählt/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /0 Events importieren/i })).toBeDisabled();
  });
});
