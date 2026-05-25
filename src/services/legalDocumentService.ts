import {
  LegalDocument,
  LegalDocumentType,
  LegalDocumentUpdate,
  LegalDocumentResponseDto,
  CreateLegalDocumentDto,
  transformBackendDtoToFrontendModel,
} from '@/models/legal-document';
import { ApiResponse, unwrapData } from '@/lib/apiUtils';
import { useApi } from '@/lib/api';

export const useLegalDocumentService = () => {
  const api = useApi();
  const baseUrl = '/legal-documents';

  /**
   * Konvertiert Backend-Typ (möglicherweise uppercase) zu Frontend-Typ (lowercase)
   */
  const normalizeType = (type: string): LegalDocumentType => {
    const normalized = type.toLowerCase();
    // Unterstütze sowohl 'agb' als auch 'agbs' für Rückwärtskompatibilität
    if (
      normalized === 'impressum' ||
      normalized === 'datenschutz' ||
      normalized === 'agb' ||
      normalized === 'agbs'
    ) {
      // Konvertiere 'agbs' zu 'agb' für Konsistenz mit Backend
      if (normalized === 'agbs') {
        return 'agb' as LegalDocumentType;
      }
      return normalized as LegalDocumentType;
    }
    throw new Error(`Ungültiger Dokumenttyp: ${type}`);
  };

  /**
   * Holt alle Dokumente eines bestimmten Typs vom Backend
   * Gibt null zurück, wenn noch kein Dokument existiert
   */
  const getLegalDocument = async (type: LegalDocumentType): Promise<LegalDocument | null> => {
    try {
      const response = await api.get<
        ApiResponse<LegalDocumentResponseDto[]> | LegalDocumentResponseDto[]
      >(`${baseUrl}/type/${type}`);

      // Unterstütze beide Formate: wrapped in ApiResponse oder direkt als Array
      let documents: LegalDocumentResponseDto[];
      if (Array.isArray(response)) {
        documents = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        documents = unwrapData(response as ApiResponse<LegalDocumentResponseDto[]>);
      } else {
        documents = [];
      }

      // Wenn kein Dokument existiert, gib null zurück
      if (!documents || documents.length === 0) {
        return null;
      }

      // Normalisiere Typen (falls Backend uppercase verwendet)
      const normalizedDocuments: LegalDocumentResponseDto[] = documents.map(doc => ({
        ...doc,
        type: normalizeType(doc.type),
      }));

      const transformed = transformBackendDtoToFrontendModel(normalizedDocuments);

      return transformed || null;
    } catch (error: any) {
      // Wenn 404 oder leeres Array, bedeutet das, dass noch kein Dokument existiert
      if (error?.status === 404 || error?.message?.includes('404')) {
        return null;
      }
      // Bei Netzwerkfehlern (z.B. Backend nicht erreichbar) ebenfalls null zurückgeben
      if (error?.isNetworkError || error?.message?.includes('Failed to fetch')) {
        console.warn(`Backend nicht erreichbar für Typ ${type}:`, error.message);
        return null;
      }
      // Bei anderen Fehlern weiterwerfen
      throw error;
    }
  };

  /**
   * Holt alle Legal-Dokumente (alle Typen)
   */
  const getAllLegalDocuments = async (): Promise<LegalDocument[]> => {
    const types: LegalDocumentType[] = ['impressum', 'datenschutz', 'agb'];

    const promises = types.map(type => getLegalDocument(type).catch(() => null));
    const results = await Promise.all(promises);

    // Filtere null-Werte heraus (Dokumente die nicht existieren)
    return results.filter((doc): doc is LegalDocument => doc !== null);
  };

  /**
   * Erstellt eine neue Version eines Legal-Dokuments (oder das erste Dokument, wenn noch keines existiert)
   */
  const updateLegalDocument = async (
    type: LegalDocumentType,
    update: LegalDocumentUpdate
  ): Promise<LegalDocument> => {
    const createDto: CreateLegalDocumentDto = {
      type,
      content: update.content,
    };

    // Backend erstellt eine neue Version (oder das erste Dokument)
    const response = await api.post<
      ApiResponse<LegalDocumentResponseDto> | LegalDocumentResponseDto
    >(baseUrl, createDto);

    // Unterstütze beide Formate: wrapped in ApiResponse oder direkt
    if (response && typeof response === 'object' && 'data' in response) {
      unwrapData(response as ApiResponse<LegalDocumentResponseDto>);
    }

    // Nach dem Erstellen die aktualisierten Dokumente laden
    const updated = await getLegalDocument(type);
    if (!updated) {
      throw new Error('Dokument konnte nicht erstellt werden');
    }
    return updated;
  };

  /**
   * Holt eine spezifische Version eines Dokuments
   */
  const getLegalDocumentVersion = async (
    type: LegalDocumentType,
    versionId: string
  ): Promise<LegalDocument['versions'][0] | null> => {
    const document = await getLegalDocument(type);
    const version = document.versions.find(v => v.id === versionId);
    return version || null;
  };

  return {
    getLegalDocument,
    getAllLegalDocuments,
    updateLegalDocument,
    getLegalDocumentVersion,
  };
};
