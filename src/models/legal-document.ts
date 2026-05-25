export type LegalDocumentType = 'impressum' | 'datenschutz' | 'agb';

// Backend DTO (wie es vom Backend kommt)
// type kann als string kommen (z.B. "IMPRESSUM" als Enum) und wird normalisiert
export interface LegalDocumentResponseDto {
  id: string;
  type: LegalDocumentType | string; // String für Enum-Konvertierung
  content: string; // Markdown content
  version: number;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

// Frontend Model (transformiert)
export interface LegalDocumentVersion {
  id: string;
  version: number;
  content: string; // Markdown content
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  currentVersion: LegalDocumentVersion;
  versions: LegalDocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface LegalDocumentUpdate {
  content: string; // Markdown content
}

export interface CreateLegalDocumentDto {
  type: LegalDocumentType;
  content: string;
}

// Helper-Funktion zur Konvertierung von Backend-DTO zu Frontend-Model
export function transformBackendDtoToFrontendModel(
  documents: LegalDocumentResponseDto[]
): LegalDocument | null {
  if (!documents || documents.length === 0) {
    return null;
  }

  // Sortiere nach Version (höchste zuerst)
  const sortedDocuments = [...documents].sort((a, b) => b.version - a.version);

  // Finde aktive Version (oder neueste, falls keine aktiv ist)
  const activeDocument = sortedDocuments.find(doc => doc.isActive) || sortedDocuments[0];
  // Normalisiere den Typ (Unterstützung für verschiedene Formate)
  const typeString = String(activeDocument.type).toLowerCase();
  let type: LegalDocumentType;
  if (typeString === 'impressum') {
    type = 'impressum';
  } else if (typeString === 'datenschutz') {
    type = 'datenschutz';
  } else if (typeString === 'agb' || typeString === 'agbs') {
    type = 'agb';
  } else {
    throw new Error(`Ungültiger Dokumenttyp: ${activeDocument.type}`);
  }

  // Transformiere alle Dokumente zu Versionen
  const versions: LegalDocumentVersion[] = sortedDocuments.map(doc => ({
    id: doc.id,
    version: doc.version,
    content: doc.content,
    createdAt: doc.createdAt,
    createdBy: doc.createdBy,
    isActive: doc.isActive,
  }));

  // Erstelle Frontend-Model
  return {
    id: `${type}-document`,
    type,
    currentVersion: {
      id: activeDocument.id,
      version: activeDocument.version,
      content: activeDocument.content,
      createdAt: activeDocument.createdAt,
      createdBy: activeDocument.createdBy,
      isActive: activeDocument.isActive,
    },
    versions,
    createdAt: sortedDocuments[sortedDocuments.length - 1].createdAt, // Älteste Version
    updatedAt: sortedDocuments[0].createdAt, // Neueste Version
  };
}
