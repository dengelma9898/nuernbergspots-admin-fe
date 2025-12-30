import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { LegalDocument } from '@/models/legal-document';
import { useLegalDocumentService } from '@/services/legalDocumentService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy, HH:mm', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

const getDocumentTitle = (type: LegalDocument['type']): string => {
  switch (type) {
    case 'impressum':
      return 'Impressum';
    case 'datenschutz':
      return 'Datenschutzerklärung';
    case 'agb':
      return 'Allgemeine Geschäftsbedingungen';
    default:
      return 'Unbekannt';
  }
};

const getDocumentDescription = (type: LegalDocument['type']): string => {
  switch (type) {
    case 'impressum':
      return 'Verwaltung der Impressums-Informationen';
    case 'datenschutz':
      return 'Verwaltung der Datenschutzerklärung';
    case 'agb':
      return 'Verwaltung der Allgemeinen Geschäftsbedingungen';
    default:
      return '';
  }
};

function LegalManagementSkeleton() {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
          {/* Header Skeleton */}
          <div className={cn(glassCard, 'p-4 sm:p-6 mb-6 sm:mb-8')}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-4">
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-8 w-64 rounded" />
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className={cn(glassCard, 'p-4 sm:p-6')}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-6 w-32 rounded" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full rounded mb-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export function LegalManagement() {
  const navigate = useNavigate();
  const legalDocumentService = useLegalDocumentService();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await legalDocumentService.getAllLegalDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Fehler beim Laden der Legal-Dokumente:', error);
      // Bei Netzwerkfehlern setze leeres Array (wird später alle Typen anzeigen)
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Definiere alle möglichen Dokumenttypen
  const allTypes: LegalDocument['type'][] = ['impressum', 'datenschutz', 'agb'];

  const handleEdit = (type: LegalDocument['type']) => {
    navigate(`/legal/${type}/edit`);
  };

  if (loading) {
    return <LegalManagementSkeleton />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={cn(glassCard, 'p-4 sm:p-6 mb-6 sm:mb-8')}
          >
            <motion.div
              variants={fadeInUp}
              className="flex flex-row items-center gap-4"
            >
              <AnimatedButton
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="icon"
                className={cn(glassButton, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück</span>
              </AnimatedButton>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Legal-Verwaltung
                </h1>
                <p className="text-muted-foreground mt-1">
                  Verwaltung von Impressum, Datenschutzerklärung und AGBs
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Legal Documents Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {allTypes.map((type, index) => {
              const document = documents.find(doc => doc.type === type);
              const exists = !!document;
              
              return (
                <motion.div key={type} variants={fadeInUp}>
                  <Card className={cn(glassCard, 'p-4 sm:p-6 h-full flex flex-col')}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {getDocumentTitle(type)}
                        </CardTitle>
                        {exists ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aktiv
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30"
                          >
                            Nicht vorhanden
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-muted-foreground">
                        {getDocumentDescription(type)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      {exists && document ? (
                        <>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Version {document.currentVersion.version}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Aktualisiert: {formatDate(document.updatedAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>{document.versions.length} Version(en)</span>
                            </div>
                          </div>
                          <AnimatedButton
                            onClick={() => handleEdit(type)}
                            className={cn(glassButton, 'w-full mt-auto')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </AnimatedButton>
                        </>
                      ) : (
                        <>
                          <div className="space-y-3 mb-4 flex-grow">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>Noch kein Dokument vorhanden</span>
                            </div>
                          </div>
                          <AnimatedButton
                            onClick={() => handleEdit(type)}
                            className={cn(glassButton, 'w-full mt-auto')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Dokument erstellen
                          </AnimatedButton>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

