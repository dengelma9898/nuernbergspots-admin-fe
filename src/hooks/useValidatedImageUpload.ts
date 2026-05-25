import { useState, useCallback } from 'react';
import { validateImageFile } from '@/utils/fileValidationUtils';

export interface ImageValidationError {
  title: string;
  message: string;
  actionHint?: string;
}

export interface UseValidatedImageUploadOptions {
  /**
   * Maximale Anzahl an Bildern (Standard: unbegrenzt)
   */
  maxImages?: number;
  /**
   * Maximale Größe pro Bild in MB (Standard: 1 MB)
   */
  maxSizeMB?: number;
  /**
   * Callback wenn Bilder erfolgreich validiert wurden
   */
  onImagesValidated?: (files: File[]) => void;
}

export interface UseValidatedImageUploadReturn {
  /**
   * Aktuell ausgewählte Dateien
   */
  files: File[];
  /**
   * Preview-URLs für die ausgewählten Bilder
   */
  previewUrls: string[];
  /**
   * Aktueller Validierungsfehler (falls vorhanden)
   */
  error: ImageValidationError | null;
  /**
   * Setzt die Fehlermeldung zurück
   */
  clearError: () => void;
  /**
   * Handler für File-Input-Änderungen
   * Validiert Bilder automatisch und setzt error-State bei Fehlern
   */
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Entfernt ein Bild an einem bestimmten Index
   */
  removeImage: (index: number) => void;
  /**
   * Entfernt alle Bilder
   */
  clearImages: () => void;
  /**
   * Setzt den File-Input zurück (für erneute Auswahl)
   */
  resetFileInput: (inputElement: HTMLInputElement | null) => void;
}

const DEFAULT_MAX_SIZE_MB = 1;

/**
 * Zentrale Hook für validierte Bild-Uploads
 *
 * Features:
 * - Automatische Validierung jedes Bildes (max 1 MB pro Bild)
 * - Unterstützt Single- und Multi-Upload
 * - Zeigt Fehlermeldungen über error-State (im Dialog anzeigen)
 * - Generiert Preview-URLs automatisch
 *
 * @example
 * ```tsx
 * const { files, previewUrls, error, handleFileChange, removeImage } = useValidatedImageUpload({
 *   maxImages: 5,
 *   onImagesValidated: (files) => console.log('Validated:', files)
 * });
 *
 * // Fehler im Dialog anzeigen:
 * {error && <Alert><AlertTitle>{error.title}</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>}
 * ```
 */
export function useValidatedImageUpload(
  options: UseValidatedImageUploadOptions = {}
): UseValidatedImageUploadReturn {
  const { maxImages, maxSizeMB = DEFAULT_MAX_SIZE_MB, onImagesValidated } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<ImageValidationError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearImages = useCallback(() => {
    setFiles([]);
    setPreviewUrls([]);
    setError(null);
  }, []);

  const resetFileInput = useCallback((inputElement: HTMLInputElement | null) => {
    if (inputElement) {
      inputElement.value = '';
    }
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      // Revoke Object URL wenn vorhanden
      if (previewUrls[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrls[index]);
      }

      setFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));

      // Lösche Fehler wenn alle Bilder entfernt wurden
      if (files.length === 1) {
        setError(null);
      }
    },
    [files.length, previewUrls]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const selectedFiles = Array.from(e.target.files);
      const currentFileCount = files.length;
      const availableSlots = maxImages ? maxImages - currentFileCount : selectedFiles.length;

      // Prüfe ob noch Platz für weitere Bilder ist
      if (maxImages && selectedFiles.length > availableSlots) {
        const friendlyError: ImageValidationError = {
          title: 'Zu viele Bilder',
          message: `Du kannst maximal ${maxImages} Bilder hochladen. Aktuell sind bereits ${currentFileCount} Bilder ausgewählt.`,
          actionHint: `Bitte entferne zuerst ${currentFileCount + selectedFiles.length - maxImages} Bild(er) oder wähle weniger Bilder aus.`,
        };
        setError(friendlyError);
        resetFileInput(e.target);
        return;
      }

      // Validiere jedes Bild einzeln
      const validFiles: File[] = [];
      const validPreviews: string[] = [];
      let hasError = false;
      let firstError: ImageValidationError | null = null;

      selectedFiles.slice(0, availableSlots).forEach(file => {
        const validation = validateImageFile(file, maxSizeMB);

        if (!validation.isValid && validation.error) {
          // Speichere den ersten Fehler
          if (!firstError) {
            firstError = {
              title: validation.error.title,
              message: validation.error.message,
              actionHint: validation.error.actionHint,
            };
          }

          hasError = true;
          return; // Überspringe ungültige Dateien
        }

        // Datei ist gültig
        validFiles.push(file);

        // Erstelle Preview
        const reader = new FileReader();
        reader.onloadend = () => {
          const previewUrl = reader.result as string;
          validPreviews.push(previewUrl);

          // Aktualisiere Previews wenn alle Reader fertig sind
          if (validPreviews.length === validFiles.length) {
            setPreviewUrls(prev => [...prev, ...validPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Zeige Fehler an, falls vorhanden (nur im Dialog, kein Toast)
      if (hasError && firstError) {
        setError(firstError);
      } else {
        // Lösche Fehler wenn alle Dateien gültig sind
        setError(null);
      }

      // Füge nur gültige Dateien hinzu
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);

        // Callback aufrufen wenn vorhanden
        if (onImagesValidated) {
          onImagesValidated(validFiles);
        }
      }

      // Setze File-Input zurück
      resetFileInput(e.target);
    },
    [files.length, maxImages, maxSizeMB, onImagesValidated, resetFileInput]
  );

  return {
    files,
    previewUrls,
    error,
    clearError,
    handleFileChange,
    removeImage,
    clearImages,
    resetFileInput,
  };
}
