/**
 * Zentrale Datei-Validierung
 * Prüft Dateien bevor sie hochgeladen werden
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: {
    title: string;
    message: string;
    actionHint?: string;
  };
}

/**
 * Validiert die Größe einer Datei
 * @param file - Die zu prüfende Datei
 * @param maxSizeMB - Maximale Größe in MB (Standard: 1 MB)
 * @returns Validation-Result mit isValid-Flag und optionaler Fehlermeldung
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = 1
): FileValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const fileSizeMB = file.size / (1024 * 1024);

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: {
        title: 'Datei ist zu groß',
        message: `Die Datei "${file.name}" ist mit ${fileSizeMB.toFixed(2)} MB zu groß. Die maximale Größe beträgt ${maxSizeMB} MB.`,
        actionHint: 'Bitte wähle eine kleinere Datei aus oder komprimiere sie vorher mit einem Bildbearbeitungsprogramm.',
      },
    };
  }

  return { isValid: true };
}

/**
 * Formatiert die Dateigröße in lesbarem Format
 * @param bytes - Größe in Bytes
 * @returns Formatierte Größe (z.B. "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validiert das Bildformat
 * @param file - Die zu prüfende Datei
 * @param allowedTypes - Erlaubte MIME-Types (Standard: ['image/jpeg', 'image/png', 'image/webp'])
 * @returns Validation-Result mit isValid-Flag und optionaler Fehlermeldung
 */
export function validateImageFormat(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    const allowedFormats = allowedTypes
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');

    return {
      isValid: false,
      error: {
        title: 'Ungültiges Bildformat',
        message: `Das Bildformat "${file.type || 'unbekannt'}" wird nicht unterstützt.`,
        actionHint: `Bitte verwende eines der folgenden Formate: ${allowedFormats}`,
      },
    };
  }

  return { isValid: true };
}

/**
 * Validiert eine Bilddatei (Größe und Format)
 * @param file - Die zu prüfende Datei
 * @param maxSizeMB - Maximale Größe in MB (Standard: 1 MB)
 * @returns Validation-Result mit isValid-Flag und optionaler Fehlermeldung
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 1
): FileValidationResult {
  // Prüfe zuerst das Format
  const formatResult = validateImageFormat(file);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // Dann die Größe
  const sizeResult = validateFileSize(file, maxSizeMB);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  return { isValid: true };
}
