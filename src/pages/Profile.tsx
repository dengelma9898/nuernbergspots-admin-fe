import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/users';
import { useUserService } from '../services/userService';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MapPin, Store, Heart, History, Settings, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const StatCard = ({
  icon: Icon,
  label,
  value,
  helpText,
  index = 0,
}: {
  icon: any;
  label: string;
  value: string | number;
  helpText?: string;
  index?: number;
}) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
  >
    <Card className={cn(glassCard, 'overflow-hidden')}>
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={cn(glassCard, 'p-3')}>
            <Icon className="h-8 w-8 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export function Profile() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userService = useUserService();

  const fetchCurrentUser = useCallback(async () => {
    const userId = getUserId();
    if (!userId || isLoading) return;

    try {
      setIsLoading(true);
      const userData = await userService.getUserProfile(userId);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
      showUserFriendlyError(error, toast, () => loadUserData(), 'load-users');
    } finally {
      setIsLoading(false);
    }
  }, [getUserId, userService, isLoading]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              className={cn(glassCard, 'p-6')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex items-center gap-4">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className={cn(glassButton, 'rounded-full')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück</span>
                </AnimatedButton>
                <h1 className="text-3xl font-bold text-foreground">Mein Profil</h1>
              </div>
            </motion.div>

            {/* Profile Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard, 'overflow-hidden')}>
                <div className="p-4 sm:p-6 border-b border-secondary">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className={cn(glassCard, 'p-1')}
                      whileHover={{ scale: 1.1 }}
                      transition={defaultTransition}
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={currentUser?.profilePictureUrl} />
                        <AvatarFallback className="bg-muted text-foreground text-xl font-bold">
                          {currentUser?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {currentUser?.name || 'Benutzer'}
                      </h2>
                      <Badge variant="secondary" className="mt-2">
                        {currentUser?.userType}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      className={cn(glassCard, 'p-4')}
                      whileHover={{ scale: 1.05 }}
                      transition={defaultTransition}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(glassCard, 'p-2')}>
                          <User className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">E-Mail</p>
                          <p className="text-lg font-bold text-foreground">
                            {currentUser?.email || '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">Hauptkontakt</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className={cn(glassCard, 'p-4')}
                      whileHover={{ scale: 1.05 }}
                      transition={defaultTransition}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(glassCard, 'p-2')}>
                          <Store className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Management ID</p>
                          <p className="text-lg font-bold text-foreground">
                            {currentUser?.managementId || '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">Business Identifikation</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className={cn(glassCard, 'p-4')}
                      whileHover={{ scale: 1.05 }}
                      transition={defaultTransition}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(glassCard, 'p-2')}>
                          <MapPin className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stadt</p>
                          <p className="text-lg font-bold text-foreground">
                            {currentUser?.currentCityId || '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">Aktueller Standort</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <Card className={cn(glassCard, 'p-4 mb-6')}>
                <h2 className="text-2xl font-bold text-foreground">Statistiken</h2>
              </Card>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <StatCard
                  icon={Store}
                  label="Besuchte Geschäfte"
                  value={currentUser?.businessHistory?.length || 0}
                  helpText="Gesamtbesuche"
                  index={0}
                />
                <StatCard
                  icon={Heart}
                  label="Favorisierte Events"
                  value={currentUser?.favoriteEventIds?.length || 0}
                  helpText="Interessante Events"
                  index={1}
                />
                <StatCard
                  icon={Store}
                  label="Favorisierte Businesses"
                  value={currentUser?.favoriteBusinessIds?.length || 0}
                  helpText="Lieblingsgeschäfte"
                  index={2}
                />
                <StatCard
                  icon={Calendar}
                  label="Mitglied seit"
                  value={
                    currentUser?.memberSince
                      ? new Date(currentUser.memberSince).toLocaleDateString()
                      : '-'
                  }
                  helpText="Registrierungsdatum"
                  index={3}
                />
              </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <Card className={cn(glassCard, 'overflow-hidden')}>
                <div className="p-4 sm:p-6 border-b border-secondary">
                  <div className="flex items-center space-x-2">
                    <div className={cn(glassCard, 'p-2')}>
                      <History className="h-5 w-5 text-foreground" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Letzte Aktivitäten</h2>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {currentUser?.businessHistory?.slice(0, 5).map((visit, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                        transition={defaultTransition}
                      >
                        <Card className={cn(glassCard, 'p-4')}>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{visit.businessName}</p>
                              <p className="text-sm text-muted-foreground">
                                Benefit: {visit.benefit}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(visit.visitedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                    {(!currentUser?.businessHistory ||
                      currentUser.businessHistory.length === 0) && (
                      <Card className={cn(glassCard, 'p-8 text-center')}>
                        <p className="text-muted-foreground">Keine Aktivitäten vorhanden</p>
                      </Card>
                    )}
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Preferences Section */}
            {(currentUser?.preferences?.length || currentUser?.language) && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.4 }}
              >
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-4 sm:p-6 border-b border-secondary">
                    <div className="flex items-center space-x-2">
                      <div className={cn(glassCard, 'p-2')}>
                        <Settings className="h-5 w-5 text-foreground" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Präferenzen</h2>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentUser.language && (
                        <Card className={cn(glassCard, 'p-4')}>
                          <p className="font-medium mb-2 text-foreground">Sprache</p>
                          <Badge variant="secondary">{currentUser.language}</Badge>
                        </Card>
                      )}
                      {currentUser.preferences?.length && currentUser.preferences.length > 0 && (
                        <Card className={cn(glassCard, 'p-4')}>
                          <p className="font-medium mb-2 text-foreground">Interessen</p>
                          <div className="flex flex-wrap gap-2">
                            {currentUser.preferences.map((pref, index) => (
                              <Badge key={index} variant="outline">
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
