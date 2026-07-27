import { buildCsvFile, CsvParseError, parseCsvFile } from '../csvEventParser';

const CSV_HEADER =
  'Titel,Beschreibung,Startdatum,Enddatum,Startzeit,Endzeit,Veranstaltungsort,Kategorien,Preis,Tickets,E-Mail,Telefon,Webseite,Social Media,Bild-URL,Detail-URL';

const createCsvFile = (content: string, name = 'test.csv'): File =>
  new File([content], name, { type: 'text/csv;charset=utf-8;' });

describe('csvEventParser', () => {
  describe('parseCsvFile', () => {
    it('parst gültige CSV-Dateien mit allen Spalten', async () => {
      const csv = `${CSV_HEADER}
Konzert im Park,Ein tolles Konzert,2026-03-15,2026-03-15,19:00,22:00,Stadtpark,Musik,15,ja,info@test.de,+49 911,https://test.de,,,https://test.de/1`;

      const rows = await parseCsvFile(createCsvFile(csv));

      expect(rows).toHaveLength(1);
      expect(rows[0].rowIndex).toBe(1);
      expect(rows[0].data.Titel).toBe('Konzert im Park');
      expect(rows[0].data.Beschreibung).toBe('Ein tolles Konzert');
      expect(rows[0].data.Startdatum).toBe('2026-03-15');
      expect(rows[0].data['E-Mail']).toBe('info@test.de');
    });

    it('parst mehrere Zeilen', async () => {
      const csv = `${CSV_HEADER}
Event A,Desc A,2026-01-01,,,,,,,,,,,,
Event B,Desc B,2026-02-01,,,,,,,,,,,,`;

      const rows = await parseCsvFile(createCsvFile(csv));
      expect(rows).toHaveLength(2);
      expect(rows[0].data.Titel).toBe('Event A');
      expect(rows[1].data.Titel).toBe('Event B');
    });

    it('wirft Fehler bei fehlenden Pflichtspalten', async () => {
      const csv = 'Beschreibung,Startdatum\nTest,2026-01-01';

      await expect(parseCsvFile(createCsvFile(csv))).rejects.toThrow(CsvParseError);
      await expect(parseCsvFile(createCsvFile(csv))).rejects.toThrow(/Titel/);
    });

    it('ignoriert unbekannte Spalten', async () => {
      const csv = `${CSV_HEADER},Ticket-URL\nTest,,2026-01-01,,,,,,,,,,,,,https://tickets.de`;

      const rows = await parseCsvFile(createCsvFile(csv));
      expect(rows).toHaveLength(1);
      expect(rows[0].data.Titel).toBe('Test');
    });

    it('wirft Fehler bei leerer Datei', async () => {
      await expect(parseCsvFile(createCsvFile(''))).rejects.toThrow(CsvParseError);
    });

    it('überspringt leere Zeilen', async () => {
      const csv = `${CSV_HEADER}
Event A,,2026-01-01,,,,,,,,,,,,
,,,,,,,,,,,,,,`;

      const rows = await parseCsvFile(createCsvFile(csv));
      expect(rows).toHaveLength(1);
    });
  });

  describe('buildCsvFile', () => {
    it('erstellt eine CSV-Datei mit Header und ausgewählten Zeilen', async () => {
      const csv = `${CSV_HEADER}
Event A,Desc A,2026-01-01,,,,,,,,,,,,
Event B,Desc B,2026-02-01,,,,,,,,,,,,`;

      const rows = await parseCsvFile(createCsvFile(csv));
      const filtered = rows.filter(row => row.data.Titel === 'Event A');
      const file = buildCsvFile(filtered, 'import.csv');

      expect(file.name).toBe('import-auswahl.csv');
      expect(file.type).toBe('text/csv;charset=utf-8;');

      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
      expect(text).toContain('Titel');
      expect(text).toContain('Event A');
      expect(text).not.toContain('Event B');
    });
  });
});
