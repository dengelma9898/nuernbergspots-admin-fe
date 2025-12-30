import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Clock,
  FileText,
  History,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showUserFriendlyError, showSuccessMessage, getUserFriendlyError } from '@/utils/errorUtils';
import { LegalDocument, LegalDocumentType, LegalDocumentVersion } from '@/models/legal-document';
import { useLegalDocumentService } from '@/services/legalDocumentService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy, HH:mm', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

const getDocumentTitle = (type: LegalDocumentType): string => {
  switch (type) {
    case 'impressum':
      return 'Impressum bearbeiten';
    case 'datenschutz':
      return 'Datenschutzerklärung bearbeiten';
    case 'agb':
      return 'AGBs bearbeiten';
    default:
      return 'Legal-Dokument bearbeiten';
  }
};

function LegalDocumentEditSkeleton() {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header Skeleton */}
          <div className={cn(glassCard, 'p-4 sm:p-6 mb-6 sm:mb-8')}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4">
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-8 w-64 rounded" />
            </div>
          </div>

          {/* Version Selector Skeleton */}
          <div className={cn(glassCard, 'p-4 sm:p-6 mb-6')}>
            <Skeleton className="h-10 w-full sm:w-64 rounded-lg mb-4" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>

          {/* Editor Skeleton */}
          <div className={cn(glassCard, 'p-4 sm:p-6')}>
            <Skeleton className="h-6 w-32 rounded mb-4" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export function LegalDocumentEdit() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: LegalDocumentType }>();
  const legalDocumentService = useLegalDocumentService();
  
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [viewingVersion, setViewingVersion] = useState<LegalDocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (type && isValidType(type)) {
      loadDocument(type);
    } else {
      showUserFriendlyError(new Error('Ungültiger Dokumenttyp'), toast, undefined, 'load-legal-document');
      navigate('/legal');
    }
  }, [type]);

  // Scroll zu Validierungsfehlern, wenn sie angezeigt werden
  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorsRef.current) {
      setTimeout(() => {
        validationErrorsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // Kleine Verzögerung, damit das Element gerendert ist
    }
  }, [validationErrors]);

  const isValidType = (t: string): t is LegalDocumentType => {
    return ['impressum', 'datenschutz', 'agb'].includes(t);
  };

  const loadDocument = async (docType: LegalDocumentType) => {
    try {
      setLoading(true);
      const data = await legalDocumentService.getLegalDocument(docType);
      
      if (data) {
        // Dokument existiert bereits
        setDocument(data);
        setCurrentContent(data.currentVersion.content);
        setSelectedVersionId(data.currentVersion.id);
        setViewingVersion(null);
      } else {
        // Noch kein Dokument vorhanden - setze leeren Zustand für Erstellung
        setDocument(null);
        setCurrentContent('');
        setSelectedVersionId(null);
        setViewingVersion(null);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Dokuments:', error);
      // Bei Netzwerkfehlern setze ebenfalls leeren Zustand
      setDocument(null);
      setCurrentContent('');
      setSelectedVersionId(null);
      setViewingVersion(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = async (versionId: string) => {
    if (!document || !type) return;

    setSelectedVersionId(versionId);
    
    if (versionId === document.currentVersion.id) {
      // Aktuelle Version anzeigen
      setCurrentContent(document.currentVersion.content);
      setViewingVersion(null);
    } else {
      // Alte Version laden und anzeigen (nur lesen)
      const version = document.versions.find(v => v.id === versionId);
      if (version) {
        setViewingVersion(version);
        setCurrentContent(version.content);
      }
    }
  };

  const handleSave = async () => {
    if (!type) return;

    // Prüfe ob Inhalt vorhanden ist
    const errors: string[] = [];
    
    if (!currentContent.trim()) {
      errors.push('Bitte gib einen Inhalt ein');
    }

    // Wenn Dokument existiert, prüfe ob sich der Inhalt geändert hat
    if (document) {
      if (viewingVersion) {
        errors.push('Du kannst nur die aktuelle Version bearbeiten');
      }
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);

    // Prüfe ob sich der Inhalt geändert hat (nur wenn Dokument existiert)
    if (document) {
      if (currentContent.trim() === document.currentVersion.content.trim()) {
        toast.info('Keine Änderungen zum Speichern');
        return;
      }
    }

    try {
      setSaving(true);
      await legalDocumentService.updateLegalDocument(type, {
        content: currentContent,
      });
      
      showSuccessMessage(toast, {
        title: document 
          ? 'Dokument erfolgreich gespeichert'
          : 'Dokument erfolgreich erstellt',
        description: document 
          ? 'Eine neue Version des Dokuments wurde erfolgreich erstellt.'
          : 'Das Dokument wurde erfolgreich erstellt.',
      });
      
      // Dokument neu laden
      await loadDocument(type);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      const friendlyError = getUserFriendlyError(error, 'save-legal-document');
      
      // Wenn Validierungsfehler vorhanden sind, zeige sie auf der Seite
      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        // Für andere Fehler zeige Toast
        showUserFriendlyError(error, toast, () => handleSave(), 'save-legal-document');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBackToCurrent = () => {
    if (!document) return;
    setSelectedVersionId(document.currentVersion.id);
    setViewingVersion(null);
    setCurrentContent(document.currentVersion.content);
  };

  if (loading || !type) {
    return <LegalDocumentEditSkeleton />;
  }

  const isNewDocument = !document;
  const isViewingOldVersion = viewingVersion !== null;
  const hasChanges = document 
    ? currentContent.trim() !== document.currentVersion.content.trim()
    : currentContent.trim().length > 0;

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={cn(glassCard, 'p-4 sm:p-6 mb-6 sm:mb-8')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4">
              <AnimatedButton
                onClick={() => navigate('/legal')}
                variant="outline"
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </AnimatedButton>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {getDocumentTitle(type)}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isNewDocument 
                    ? 'Noch kein Dokument vorhanden - erstelle das erste Dokument'
                    : `Aktuelle Version: ${document.currentVersion.version}`
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Version Selector - nur anzeigen wenn Dokument existiert */}
          {!isNewDocument && document && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className={cn(glassCard, 'p-4 sm:p-6 mb-6')}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Version auswählen
                  </label>
                  <Select
                    value={selectedVersionId || ''}
                    onValueChange={handleVersionChange}
                  >
                    <SelectTrigger className={cn(glassInput, 'w-full sm:w-64')}>
                      <SelectValue placeholder="Version auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={document.currentVersion.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Version {document.currentVersion.version} (Aktuell)</span>
                        </div>
                      </SelectItem>
                      {document.versions
                        .filter(v => v.id !== document.currentVersion.id)
                        .sort((a, b) => b.version - a.version)
                        .map(version => (
                          <SelectItem key={version.id} value={version.id}>
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4" />
                              <span>Version {version.version}</span>
                              <span className="text-xs text-muted-foreground">
                                ({formatDate(version.createdAt)})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {isViewingOldVersion && (
                  <div className="flex items-center gap-2">
                    <AnimatedButton
                      onClick={handleBackToCurrent}
                      variant="outline"
                      className={cn(glassButton)}
                    >
                      Zur aktuellen Version
                    </AnimatedButton>
                  </div>
                )}
              </div>
              {isViewingOldVersion && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Du siehst eine alte Version. Diese kann nicht bearbeitet werden.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Info-Banner für neues Dokument */}
          {isNewDocument && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className={cn(glassCard, 'p-4 sm:p-6 mb-6 bg-blue-500/10 border border-blue-500/30')}
            >
              <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Noch kein Dokument vorhanden. Gib den Inhalt ein und speichere, um das erste Dokument zu erstellen.
              </p>
            </motion.div>
          )}

          {/* Editor */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={cn(glassCard, 'p-4 sm:p-6')}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Inhalt {isViewingOldVersion && `(Version ${viewingVersion?.version})`}
              </h2>
              {!isViewingOldVersion && (
                <p className="text-sm text-muted-foreground">
                  {isNewDocument
                    ? 'Gib den Inhalt im Markdown-Format ein. Beim Speichern wird das erste Dokument erstellt.'
                    : 'Bearbeite den Inhalt im Markdown-Format. Beim Speichern wird automatisch eine neue Version erstellt.'
                  }
                </p>
              )}
            </div>
            
            {/* Validierungsfehler */}
            {validationErrors.length > 0 && (
              <Alert 
                ref={validationErrorsRef}
                variant="destructive" 
                className={cn(glassCard, 'border-destructive/50 mb-6')}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <MarkdownEditor
                value={currentContent}
                onChange={(value) => {
                  setCurrentContent(value);
                  // Fehler zurücksetzen, wenn Wert geändert wird
                  if (validationErrors.length > 0) {
                    setValidationErrors([]);
                  }
                }}
                placeholder="Markdown-Text eingeben..."
                minHeight="min-h-[500px]"
                required
                className={isViewingOldVersion ? 'opacity-75 pointer-events-none' : ''}
              />
            </div>

            {!isViewingOldVersion && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <LoadingButton
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  loading={saving}
                  className={cn(glassButton, 'flex-1 sm:flex-none')}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isNewDocument 
                    ? 'Dokument erstellen'
                    : hasChanges 
                      ? 'Neue Version speichern' 
                      : 'Speichern'
                  }
                </LoadingButton>
                {hasChanges && document && (
                  <AnimatedButton
                    onClick={() => {
                      setCurrentContent(document.currentVersion.content);
                      toast.info('Änderungen verworfen');
                    }}
                    variant="outline"
                    className={cn(glassButton, 'flex-1 sm:flex-none')}
                  >
                    Änderungen verwerfen
                  </AnimatedButton>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

