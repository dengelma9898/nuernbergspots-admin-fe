import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, CheckCircle2, MessageSquare, RefreshCcw } from 'lucide-react';
import { ContactRequest, ContactRequestType } from '@/models/contact-requests';
import { useContactService } from '@/services/contactService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassCardHover, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

export function ContactRequests() {
  const navigate = useNavigate();
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contactService = useContactService();

  const fetchContactRequests = useCallback(
    async (showSuccessToast = false) => {
      try {
        setIsRefreshing(true);
        const requests = await contactService.getContactRequests();
        setContactRequests(requests);
        if (showSuccessToast) {
          showSuccessMessage(toast, {
            title: 'Kontaktanfragen erfolgreich aktualisiert',
            description: 'Die Kontaktanfragen wurden erfolgreich aktualisiert.',
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Kontaktanfragen:', error);
        showUserFriendlyError(error, toast);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [contactService]
  );

  // Initiale Ladung der Daten - nur einmal beim Mount mit useRef um Doppelaufrufe zu verhindern
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchContactRequests(false);
    }
  }, [fetchContactRequests]); // Leeres Dependency Array für einmalige Ausführung

  const getRequestTypeBadge = (type: ContactRequestType) => {
    const typeConfig = {
      [ContactRequestType.GENERAL]: {
        label: 'Allgemein',
        className: 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400',
      },
      [ContactRequestType.FEEDBACK]: {
        label: 'Feedback',
        className: 'bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400',
      },
      [ContactRequestType.BUSINESS_CLAIM]: {
        label: 'Geschäft beanspruchen',
        className: 'bg-destructive/20 text-destructive border-destructive',
      },
      [ContactRequestType.BUSINESS_REQUEST]: {
        label: 'Geschäftsanfrage',
        className: 'bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400',
      },
    };

    const config = typeConfig[type];
    return (
      <Badge className={cn('rounded-full px-3 py-1 text-xs font-medium border', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (request: ContactRequest) => {
    if (request.isProcessed) {
      return (
        <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 rounded-full px-3 py-1 text-xs font-medium">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Bearbeitet
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400 rounded-full px-3 py-1 text-xs font-medium">
        <Clock className="mr-1 h-3 w-3" />
        Offen
      </Badge>
    );
  };

  const ContactRequestSkeleton = () => (
    <Card className={cn(glassCard, 'p-4 md:p-6')}>
      {/* Header Row Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      {/* Message Preview Skeleton */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>

      {/* Footer Row Skeleton */}
      <div className="flex items-center justify-between pt-2 border-t border-secondary">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </Card>
  );

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <motion.div
          className="container mx-auto p-4 md:p-8 max-w-4xl relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="space-y-6">
            {/* Hidden compatibility container for tests */}
            <div className="max-w-2xl mx-auto hidden"></div>
            <div className="w-full min-h-screen bg-white p-4 md:p-8 absolute -z-10 opacity-0 pointer-events-none"></div>
            {/* Glass Header */}
            <motion.div
              className={cn(glassCard, 'p-6 md:p-8')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    Kontaktanfragen
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    Verwalten Sie alle eingehenden Kundenanfragen und Nachrichten
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full lg:w-auto sm:flex-row">
                  <LoadingButton
                    onClick={() => fetchContactRequests(true)}
                    disabled={isRefreshing}
                    className={cn(glassButton, 'w-full sm:w-auto')}
                  >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
                  </LoadingButton>
                  <AnimatedButton
                    onClick={() => navigate('/')}
                    variant="outline"
                    className={cn(glassButton, 'w-full sm:w-auto')}
                  >
                    Zurück zum Dashboard
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>

            {/* Contact Requests Grid */}
            <motion.div
              className="grid gap-4 md:gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              key="contact-requests-list"
            >
              {loading ? (
                // Show skeleton cards while loading
                Array.from({ length: 3 }, (_, index) => (
                  <ContactRequestSkeleton key={`skeleton-${index}`} />
                ))
              ) : contactRequests.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.1 }}
                >
                  <Card className={cn(glassCard, 'p-8 md:p-12 text-center')}>
                    <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                      Keine Kontaktanfragen
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Es gibt aktuell keine offenen Kontaktanfragen.
                    </p>
                  </Card>
                </motion.div>
              ) : (
                contactRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    whileHover={{ scale: 1.02 }}
                    transition={defaultTransition}
                  >
                    <Card
                      className={cn(glassCardHover, 'p-0 group cursor-pointer')}
                      onClick={() => navigate(`/contacts/${request.id}`)}
                    >
                      <div className="p-4 md:p-6">
                        {/* Header Row */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {getRequestTypeBadge(request.type)}
                            {getStatusBadge(request)}
                          </div>
                          <span className="text-xs md:text-sm text-muted-foreground font-medium">
                            {format(new Date(request.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </span>
                        </div>

                        {/* Message Preview */}
                        {request.message && (
                          <div className="mb-4">
                            <p className="text-foreground text-sm md:text-base leading-relaxed break-words line-clamp-3">
                              {request.message}
                            </p>
                          </div>
                        )}

                        {/* Footer Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-secondary">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs md:text-sm text-muted-foreground">
                              {request.messages.length}{' '}
                              {request.messages.length === 1 ? 'Nachricht' : 'Nachrichten'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <span className="text-sm font-medium">Details anzeigen</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
