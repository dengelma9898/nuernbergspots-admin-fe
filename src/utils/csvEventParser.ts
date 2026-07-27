import Papa from 'papaparse';

export const CSV_COLUMNS = [
  { name: 'Titel', required: true, format: 'Freitext' },
  { name: 'Beschreibung', required: false, format: 'Freitext' },
  { name: 'Startdatum', required: true, format: 'YYYY-MM-DD (z.B. 2026-02-09)' },
  { name: 'Enddatum', required: false, format: 'YYYY-MM-DD (wenn leer = Startdatum)' },
  { name: 'Startzeit', required: false, format: 'HH:mm (z.B. 19:45)' },
  { name: 'Endzeit', required: false, format: 'HH:mm (z.B. 22:00)' },
  { name: 'Veranstaltungsort', required: false, format: 'Freitext' },
  { name: 'Kategorien', required: false, format: 'Freitext (automatisches Mapping)' },
  { name: 'Preis', required: false, format: 'Kostenlos, 15, ab 10,00€' },
  { name: 'Tickets', required: false, format: 'ja / nein' },
  { name: 'E-Mail', required: false, format: 'Gültige E-Mail-Adresse' },
  { name: 'Telefon', required: false, format: 'Telefonnummer' },
  { name: 'Webseite', required: false, format: 'URL' },
  { name: 'Social Media', required: false, format: 'URL' },
  { name: 'Bild-URL', required: false, format: 'URL (wird aktuell nicht verarbeitet)' },
  { name: 'Detail-URL', required: false, format: 'URL (Webseite-Fallback)' },
] as const;

export const CSV_COLUMN_NAMES = CSV_COLUMNS.map(col => col.name);

export type CsvColumnName = (typeof CSV_COLUMNS)[number]['name'];

export interface CsvEventRow {
  rowIndex: number;
  data: Record<CsvColumnName, string>;
}

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvParseError';
  }
}

const emptyRowData = (): Record<CsvColumnName, string> =>
  Object.fromEntries(CSV_COLUMN_NAMES.map(name => [name, ''])) as Record<CsvColumnName, string>;

const normalizeHeader = (header: string): string => header.trim();

const validateHeaders = (headers: string[]): void => {
  const normalized = headers.map(normalizeHeader);
  const missingRequired = CSV_COLUMNS.filter(col => col.required).filter(
    col => !normalized.includes(col.name)
  );

  if (missingRequired.length > 0) {
    throw new CsvParseError(
      `Fehlende Pflichtspalten: ${missingRequired.map(col => col.name).join(', ')}`
    );
  }

  const unknownHeaders = normalized.filter(
    header => header && !CSV_COLUMN_NAMES.includes(header as CsvColumnName)
  );
  if (unknownHeaders.length > 0) {
    console.warn(`CSV enthält unbekannte Spalten (werden ignoriert): ${unknownHeaders.join(', ')}`);
  }
};

const mapRecordToRowData = (record: Record<string, string>): Record<CsvColumnName, string> => {
  const data = emptyRowData();
  for (const columnName of CSV_COLUMN_NAMES) {
    data[columnName] = (record[columnName] ?? '').trim();
  }
  return data;
};

const isEmptyRow = (data: Record<CsvColumnName, string>): boolean =>
  CSV_COLUMN_NAMES.every(name => !data[name]);

/**
 * Parst eine CSV-Datei und gibt alle Datenzeilen zurück (ohne Header).
 */
export const parseCsvFile = (file: File): Promise<CsvEventRow[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: results => {
        try {
          const fatalErrors = results.errors.filter(
            error => error.type !== 'FieldMismatch' && error.code !== 'TooFewFields' && error.code !== 'TooManyFields'
          );
          if (fatalErrors.length > 0) {
            const firstError = fatalErrors[0];
            throw new CsvParseError(firstError.message || 'CSV konnte nicht gelesen werden.');
          }

          const headers = results.meta.fields ?? [];
          if (headers.length === 0) {
            throw new CsvParseError('Die CSV-Datei enthält keine Header-Zeile.');
          }

          validateHeaders(headers);

          const rows: CsvEventRow[] = [];
          results.data.forEach((record, index) => {
            const data = mapRecordToRowData(record);
            if (isEmptyRow(data)) {
              return;
            }
            rows.push({ rowIndex: index + 1, data });
          });

          if (rows.length === 0) {
            throw new CsvParseError('Die CSV-Datei enthält keine Datenzeilen.');
          }

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      },
      error: error => {
        reject(new CsvParseError(error.message || 'CSV konnte nicht gelesen werden.'));
      },
    });
  });

/**
 * Erstellt eine neue CSV-Datei aus ausgewählten Zeilen (inkl. Header).
 */
export const buildCsvFile = (rows: CsvEventRow[], originalFileName: string): File => {
  const csvContent = Papa.unparse({
    fields: [...CSV_COLUMN_NAMES],
    data: rows.map(row => CSV_COLUMN_NAMES.map(name => row.data[name] ?? '')),
  });

  const baseName = originalFileName.replace(/\.csv$/i, '') || 'events-import';
  return new File([csvContent], `${baseName}-auswahl.csv`, { type: 'text/csv;charset=utf-8;' });
};

/**
 * Rekonstruiert CSV-Felder aus Import-Fehlermeldungen.
 */
export const csvDataFromImportErrors = (
  errors: Array<{ field?: string; value?: unknown }>
): Record<CsvColumnName, string> => {
  const data = emptyRowData();
  for (const error of errors) {
    if (error.field && CSV_COLUMN_NAMES.includes(error.field as CsvColumnName)) {
      data[error.field as CsvColumnName] =
        error.value !== undefined && error.value !== null ? String(error.value) : '';
    }
  }
  return data;
};
