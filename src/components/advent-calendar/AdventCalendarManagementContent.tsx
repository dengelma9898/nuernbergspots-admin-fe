import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useAdventCalendarManagement } from '@/hooks/useAdventCalendarManagement';
import {
  AdventCalendarEntryCard,
  AdventCalendarEntryCardMobile,
} from '@/components/advent-calendar/AdventCalendarCards';
import { AdventCalendarManagementPageSkeleton } from '@/components/advent-calendar/AdventCalendarSkeletons';

export function AdventCalendarManagementContent() {
  const {
    navigate,
    loading,
    searchQuery,
    setSearchQuery,
    featureStatus,
    isLoadingFeatureStatus,
    isUpdatingFeatureStatus,
    isAdminOrSuperAdmin,
    filteredEntries,
    handleFeatureStatusToggle,
    handleDelete,
  } = useAdventCalendarManagement();

  if (loading) {
    return <AdventCalendarManagementPageSkeleton />;
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
              Adventskalender Verwaltung
            </h1>
            <div className="w-full sm:w-auto sm:ml-auto">
              <LoadingButton
                onClick={() => navigate('/advent-calendar/new')}
                className={cn(buttonPreset, 'w-full sm:w-auto')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Eintrag hinzufügen
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
                    {featureStatus && (
                      <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                        Aktiviert
                      </Badge>
                    )}
                    {!featureStatus && (
                      <Badge className="bg-destructive/20 text-destructive border-destructive">
                        Deaktiviert
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {featureStatus
                      ? 'Das Adventskalender-Feature ist aktiviert und für Benutzer verfügbar.'
                      : 'Das Adventskalender-Feature ist deaktiviert und für Benutzer nicht verfügbar.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isLoadingFeatureStatus ? (
                    <Skeleton className="h-6 w-12 rounded-full" />
                  ) : (
                    <Switch
                      id="feature-status"
                      checked={featureStatus}
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
            </Card>
          </motion.div>
        )}

        {!isAdminOrSuperAdmin && !isLoadingFeatureStatus && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <Card className={cn(cardPreset, 'p-6 mb-6')}>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-foreground" />
                <div className="flex-1">
                  <Label className="text-foreground text-lg font-semibold">Feature-Status</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {featureStatus ? (
                      <>
                        <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 mr-2">
                          Aktiviert
                        </Badge>
                        Das Adventskalender-Feature ist aktiviert.
                      </>
                    ) : (
                      <>
                        <Badge className="bg-destructive/20 text-destructive border-destructive mr-2">
                          Deaktiviert
                        </Badge>
                        Das Adventskalender-Feature ist deaktiviert.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

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
                placeholder="Nach Einträgen suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(inputPreset, 'rounded-lg pl-10')}
              />
            </div>
          </Card>
        </motion.div>

        {filteredEntries.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.3 }}
          >
            <Card className={cn(cardPreset, 'p-8 text-center')}>
              <div className="text-foreground text-lg">
                Keine Adventskalender-Einträge gefunden.
              </div>
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
              {filteredEntries.map(entry => (
                <motion.div key={entry.id} variants={fadeInUp}>
                  <AdventCalendarEntryCardMobile
                    entry={entry}
                    onDelete={handleDelete}
                    navigate={navigate}
                  />
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredEntries.map(entry => (
                <motion.div key={entry.id} variants={fadeInUp}>
                  <AdventCalendarEntryCard entry={entry} onDelete={handleDelete} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
