import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useEasterEggManagement } from '@/hooks/useEasterEggManagement';
import { EasterEggCard, EasterEggCardMobile } from '@/components/easter-egg/EasterEggCards';
import {
  EasterEggCardSkeleton,
  EasterEggMobileSkeleton,
} from '@/components/easter-egg/EasterEggSkeletons';
import {
  ArrowLeft,
  Plus,
  Search,
  Settings,
  Users,
  Trophy,
  Egg,
  BarChart3,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export function EasterEggManagementContent() {
  const {
    navigate,
    statistics,
    searchQuery,
    setSearchQuery,
    featureStatus,
    startDateInput,
    setStartDateInput,
    isLoadingFeatureStatus,
    isUpdatingFeatureStatus,
    isAdminOrSuperAdmin,
    featureDisabledError,
    filteredEggs,
    loading,
    isInitialLoading,
    handleFeatureStatusToggle,
    handleStartDateSave,
    handleDelete,
  } = useEasterEggManagement();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
          <Card className={cn(cardPreset, 'p-6 mb-6')}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-8 w-48 rounded" />
              <div className="w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-10 w-56 rounded-xl" />
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className={cn(cardPreset, 'p-4')}>
                <Skeleton className="h-6 w-16 rounded mb-2" />
                <Skeleton className="h-4 w-24 rounded" />
              </Card>
            ))}
          </div>
          <Card className={cn(cardPreset, 'p-6 mb-6')}>
            <Skeleton className="h-10 w-full rounded-lg" />
          </Card>
          <div className="block md:hidden space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <EasterEggMobileSkeleton key={i} />
            ))}
          </div>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EasterEggCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className={cn(cardPreset, 'p-6 mb-6')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-row items-center gap-4">
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className={cn(buttonPreset, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zum Dashboard</span>
            </LoadingButton>
            <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto text-foreground">
              Ostereiersuche Verwaltung
            </h1>
            <div className="w-full sm:w-auto sm:ml-auto">
              <LoadingButton
                onClick={() => navigate('/easter-egg-hunt/new')}
                className={cn(buttonPreset, 'w-full sm:w-auto')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Osterei anlegen
              </LoadingButton>
            </div>
          </div>
        </motion.div>

        {isAdminOrSuperAdmin && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(cardPreset, 'p-6 mb-6')}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-foreground" />
                      <Label
                        htmlFor="feature-status"
                        className="text-foreground text-lg font-semibold"
                      >
                        Feature-Status
                      </Label>
                      <Badge
                        className={cn(
                          featureStatus.isFeatureActive
                            ? 'bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
                            : 'bg-destructive/20 text-destructive border-destructive'
                        )}
                      >
                        {featureStatus.isFeatureActive ? 'Aktiviert' : 'Deaktiviert'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {featureStatus.isFeatureActive
                        ? 'Die Ostereiersuche ist aktiviert und für Benutzer verfügbar.'
                        : 'Die Ostereiersuche ist deaktiviert und für Benutzer nicht verfügbar.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isLoadingFeatureStatus ? (
                      <Skeleton className="h-6 w-12 rounded-full" />
                    ) : (
                      <Switch
                        id="feature-status"
                        checked={featureStatus.isFeatureActive}
                        onCheckedChange={handleFeatureStatusToggle}
                        disabled={isUpdatingFeatureStatus}
                        className={cn(
                          'data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500',
                          'data-[state=unchecked]:bg-red-600 dark:data-[state=unchecked]:bg-red-500'
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-2 border-t border-secondary">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="startDate" className="text-foreground text-sm font-medium">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Startdatum der Ostereiersuche
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDateInput}
                      onChange={e => setStartDateInput(e.target.value)}
                      className={cn(inputPreset, 'max-w-xs')}
                    />
                  </div>
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    onClick={handleStartDateSave}
                    disabled={
                      isUpdatingFeatureStatus || startDateInput === (featureStatus.startDate || '')
                    }
                    className={cn(buttonPreset)}
                  >
                    Datum speichern
                  </LoadingButton>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {statistics && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.15 }}
          >
            <Card className={cn(cardPreset, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <Egg className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Gesamt</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{statistics.totalEggs}</div>
            </Card>
            <Card className={cn(cardPreset, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Aktiv</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{statistics.activeEggs}</div>
            </Card>
            <Card className={cn(cardPreset, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Teilnehmer</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statistics.totalParticipants}
              </div>
            </Card>
            <Card className={cn(cardPreset, 'p-4')}>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Gewinner</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{statistics.totalWinners}</div>
            </Card>
          </motion.div>
        )}

        {featureDisabledError && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <Alert className={cn(cardPreset, 'mb-6 border-amber-500/50')}>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-foreground">
                Ostereiersuche ist derzeit deaktiviert
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Die Ostereier-Liste kann nicht geladen werden, solange das Feature deaktiviert ist.
                {isAdminOrSuperAdmin && (
                  <span> Bitte aktivieren Sie das Feature oben in den Einstellungen.</span>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!featureDisabledError && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <Card className={cn(cardPreset, 'p-6 mb-6')}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Ostereiern suchen..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(inputPreset, 'rounded-lg pl-10')}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {!featureDisabledError && (
          <>
            {filteredEggs.length === 0 && !loading ? (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.3 }}
              >
                <Card className={cn(cardPreset, 'p-8 text-center')}>
                  <Egg className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-foreground text-lg">Keine Ostereier gefunden.</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Erstelle dein erstes Osterei, um loszulegen.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="block md:hidden space-y-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {filteredEggs.map(egg => (
                    <motion.div key={egg.id} variants={fadeInUp}>
                      <EasterEggCardMobile egg={egg} onDelete={handleDelete} navigate={navigate} />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {filteredEggs.map(egg => (
                    <motion.div key={egg.id} variants={fadeInUp}>
                      <EasterEggCard egg={egg} onDelete={handleDelete} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
