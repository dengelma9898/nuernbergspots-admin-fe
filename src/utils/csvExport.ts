export type CsvRow = Record<string, string | number | boolean | null | undefined>;

function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function rowsToCsv(rows: CsvRow[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvValue).join(',');
  const dataLines = rows.map(row => headers.map(header => escapeCsvValue(row[header])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export function downloadCsv(filename: string, rows: CsvRow[]): void {
  if (rows.length === 0) return;
  downloadCsvContent(filename, rowsToCsv(rows));
}

export function downloadCsvContent(filename: string, csv: string): void {
  if (!csv.trim()) return;
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
