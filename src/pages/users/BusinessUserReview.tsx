import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Building2, CheckCircle2, XCircle, ArrowLeft, Tag, Store } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { BusinessUser } from '@/models/users';
import { useUserService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

export const BusinessUserReview: React.FC = () => {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const userService = useUserService();
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getBusinessUsersInReview();
      setUsers(fetchedUsers.filter(user => user.needsReview));
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      showUserFriendlyError(error, toast, () => loadUsers(), 'load-users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await userService.updateBusinessUserReviewStatus(userId, false);
      showSuccessMessage(toast, {
        title: 'Benutzer verifiziert',
        description: 'Der Benutzer wurde erfolgreich verifiziert.',
      });
      loadUsers();
    } catch (error) {
      console.error('Fehler bei der Verifizierung:', error);
      showUserFriendlyError(error, toast, () => handleApprove(userId), 'generic');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await userService.updateBusinessUserReviewStatus(userId, false);
      showSuccessMessage(toast, {
        title: 'Benutzer abgelehnt',
        description: 'Der Benutzer wurde erfolgreich abgelehnt.',
      });
      loadUsers();
    } catch (error) {
      console.error('Fehler bei der Ablehnung:', error);
      showUserFriendlyError(error, toast, () => handleReject(userId), 'generic');
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className={cn(glassButton, 'rounded-full p-2')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </AnimatedButton>
                <span className="sr-only">Zurück zum Dashboard</span>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-64 rounded" />
              ) : (
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight break-words">
                  Geschäftsinhaber prüfen
                </h1>
              )}
            </div>
          </motion.div>

          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Stats Card */}
            {loading ? (
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'p-6')}>
                  <Skeleton className="h-4 w-48 rounded" />
                </Card>
              </motion.div>
            ) : (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                <Card className={cn(glassCard, 'p-6')}>
                  <div className="text-sm text-muted-foreground">
                    {users.length} Benutzer zur Überprüfung gefunden
                  </div>
                </Card>
              </motion.div>
            )}

            {/* User Cards */}
            {loading ? (
              <motion.div
                className="grid grid-cols-1 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <Card className={cn(glassCard, 'overflow-hidden')}>
                      <div className="p-4 sm:p-6">
                        {/* Header Skeleton */}
                        <div className="border-b border-secondary pb-4 mb-4">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="space-y-1 min-w-0">
                              <Skeleton className="h-6 w-32 rounded" />
                              <Skeleton className="h-3 w-24 rounded" />
                            </div>
                            <Skeleton className="h-6 w-40 rounded-xl" />
                          </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center text-sm">
                                <Skeleton className="h-8 w-8 rounded-lg mr-3" />
                                <Skeleton className="h-4 w-48 rounded" />
                              </div>
                              <div className="flex items-center text-sm">
                                <Skeleton className="h-8 w-8 rounded-lg mr-3" />
                                <Skeleton className="h-4 w-32 rounded" />
                              </div>
                            </div>
                            <div className="space-y-2 min-w-0 text-right">
                              <div className="flex items-center justify-end">
                                <Skeleton className="h-4 w-16 rounded" />
                                <Skeleton className="h-8 w-8 rounded-lg ml-3" />
                              </div>
                              <div className="flex items-center justify-end">
                                <Skeleton className="h-3 w-32 rounded" />
                              </div>
                            </div>
                          </div>

                          {/* Business Names Section Skeleton */}
                          <div className="border-t border-secondary pt-4">
                            <Skeleton className="h-4 w-40 rounded mb-3" />
                            <div className="space-y-2">
                              {[...Array(2)].map((_, j) => (
                                <div
                                  key={j}
                                  className={cn(glassCard, 'flex items-center p-3')}
                                >
                                  <Skeleton className="h-8 w-8 rounded-lg mr-3" />
                                  <Skeleton className="h-4 w-40 rounded" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions Skeleton */}
                        <div className="pt-6 flex flex-col sm:flex-row justify-end gap-2">
                          <div className="w-full sm:w-auto">
                            <Skeleton className="h-8 w-full sm:w-24 rounded-xl" />
                          </div>
                          <div className="w-full sm:w-auto">
                            <Skeleton className="h-8 w-full sm:w-28 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : users.length === 0 ? (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={defaultTransition}
              >
                <Card className={cn(glassCard, 'p-8 text-center')}>
                  <div className="text-muted-foreground">Keine Benutzer zur Überprüfung gefunden.</div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={`users-${users.length}`}
                className="grid grid-cols-1 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {users.map((user) => (
                  <motion.div key={user.id} variants={fadeInUp}>
                    <Card className={cn(glassCard, 'overflow-hidden')} data-slot="card">
                      <div className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="border-b border-secondary pb-4 mb-4">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="text-lg font-semibold text-foreground">Business User</div>
                              <div className="text-xs text-muted-foreground break-all truncate max-w-xs sm:max-w-none">
                                ID: {user.id}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Überprüfung erforderlich
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center text-sm break-all truncate max-w-full">
                                <div className={cn(glassCard, 'p-2 mr-3')}>
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium text-foreground">{user.email}</span>
                              </div>
                              {user.businessIds && user.businessIds.length > 0 && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <div className={cn(glassCard, 'p-2 mr-3')}>
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  {user.businessIds.length}{' '}
                                  {user.businessIds.length === 1 ? 'Geschäft' : 'Geschäfte'} zugewiesen
                                </div>
                              )}
                            </div>
                            <div className="space-y-2 min-w-0 text-right">
                              <div className="flex items-center text-sm justify-end">
                                <span
                                  className={cn(
                                    'font-medium',
                                    user.isDeleted ? 'text-destructive' : 'text-primary'
                                  )}
                                >
                                  {user.isDeleted ? 'Gelöscht' : 'Aktiv'}
                                </span>
                                <div className={cn(glassCard, 'p-2 ml-3')}>
                                  <Tag className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="flex items-center text-xs justify-end text-muted-foreground">
                                Registriert am {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </div>

                          {user.businessNames && user.businessNames.length > 0 && (
                            <div className="border-t border-secondary pt-4">
                              <div className="text-sm font-medium mb-3 text-foreground">
                                Beanspruchte Geschäfte:
                              </div>
                              <div className="space-y-2">
                                {user.businessNames.map(name => (
                                  <div
                                    key={name}
                                    className={cn(glassCard, 'flex items-center text-sm p-3 break-all truncate max-w-full')}
                                  >
                                    <div className={cn(glassCard, 'p-2 mr-3')}>
                                      <Store className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="font-medium text-foreground">{name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div
                          className="pt-6 flex flex-col sm:flex-row justify-end gap-2"
                          data-slot="card-footer"
                        >
                          <div className="w-full sm:w-auto">
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(user.id)}
                              className="text-destructive w-full sm:w-auto"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Ablehnen
                            </AnimatedButton>
                          </div>
                          <div className="w-full sm:w-auto">
                            <LoadingButton
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              isLoading={false}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Verifizieren
                            </LoadingButton>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
