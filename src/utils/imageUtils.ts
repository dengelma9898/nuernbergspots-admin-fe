/**
 * Komprimiert und resized ein Bild vor dem Upload
 * @param file - Die Original-Bilddatei
 * @param maxWidth - Maximale Breite in Pixeln (Standard: 1920)
 * @param maxHeight - Maximale Höhe in Pixeln (Standard: 1920)
 * @param quality - Komprimierungsqualität 0-1 (Standard: 0.8)
 * @param maxSizeMB - Maximale Dateigröße in MB (Standard: 2)
 * @returns Promise mit der komprimierten File-Instanz
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8,
  maxSizeMB: number = 2
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Prüfe ob es ein Bild ist
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Wenn die Datei bereits klein genug ist, keine Komprimierung nötig
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Berechne neue Dimensionen
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Erstelle Canvas und zeichne Bild
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas-Kontext konnte nicht erstellt werden'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Konvertiere zu Blob mit Komprimierung
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Bild konnte nicht komprimiert werden'));
              return;
            }

            // Erstelle neue File-Instanz mit Original-Namen
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Bild konnte nicht geladen werden'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Datei konnte nicht gelesen werden'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validiert die Bilddateigröße
 * @param file - Die Bilddatei
 * @param maxSizeMB - Maximale Größe in MB (Standard: 5)
 * @returns true wenn die Datei zu groß ist
 */
export function isImageTooLarge(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
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
