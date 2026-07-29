import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from '@/components/motion';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, cardPresetHover } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { BusinessAnalytics, DashboardAnalytics } from '@/models/business';
import { Users } from 'lucide-react';

export function BusinessAnalyticsCard({
  business,
  isLoading,
}: {
  business: BusinessAnalytics;
  isLoading?: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(cardPresetHover, 'gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardHeader className="!px-4 !pt-4 !pb-2 border-b border-secondary gap-0">
          <div className="flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-6 w-32 rounded" />
            ) : (
              <>
                <h3 className="text-sm font-medium text-foreground">{business.businessName}</h3>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{business.uniqueCustomers}</span>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="!px-4 !py-4 gap-0">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-2 w-full rounded" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gesamtscans</span>
                <span className="font-medium text-foreground">{business.totalScans}</span>
              </div>
              <div className="bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${(business.totalScans / business.yearlyScans) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <div className="font-medium text-foreground">{business.weeklyScans}</div>
                  Woche
                </div>
                <div>
                  <div className="font-medium text-foreground">{business.monthlyScans}</div>
                  Monat
                </div>
                <div>
                  <div className="font-medium text-foreground">{business.yearlyScans}</div>
                  Jahr
                </div>
              </div>
              <div className="pt-2 border-t border-secondary flex justify-between text-xs text-muted-foreground">
                <div>
                  <span>Ø Preis:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {business.averagePrice.toFixed(2)}€
                  </span>
                </div>
                <div>
                  <span>Ø Personen:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {business.averageNumberOfPeople.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-secondary grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <div className="font-medium text-foreground">
                    {business.customerRetention.returningCustomers}
                  </div>
                  Stammkunden
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {business.customerRetention.retentionRate.toFixed(1)}%
                  </div>
                  Treue-Rate
                </div>
              </div>
              <div className="pt-2 border-t border-secondary text-xs text-muted-foreground">
                <div className="mb-1">Beliebteste Zeiten:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium text-foreground">
                      {business.peakTimes.dayOfWeek}
                    </span>
                    <span className="block">Tag</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {business.peakTimes.timeOfDay}
                    </span>
                    <span className="block">Uhrzeit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TimeAnalysisCard({
  analytics,
  isLoading,
}: {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition} className="space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Zeitanalyse</h3>
        <p className="text-sm text-muted-foreground">Besuchermuster und Stoßzeiten</p>
      </div>
      <Card className={cn(cardPresetHover, 'gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardContent className="!px-4 !py-4 gap-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-foreground">Beliebteste Tage</h4>
                  <div className="space-y-1">
                    {analytics?.timeAnalysis.peakDays.slice(0, 3).map((day, index) => (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{day}</span>
                        <span className="font-medium text-foreground">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 text-foreground">Stoßzeiten</h4>
                  <div className="space-y-1">
                    {analytics?.timeAnalysis.peakHours.slice(0, 3).map((hour, index) => (
                      <div key={hour} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{hour} Uhr</span>
                        <span className="font-medium text-foreground">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-secondary">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">
                    Durchschnittliche Besuche pro Tag
                  </h4>
                  <span className="text-lg font-bold text-foreground">
                    {analytics?.categoryAnalysis.averageVisitsPerDay.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CustomerRetentionCard({
  analytics,
  isLoading,
}: {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition} className="space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Kundenbindung</h3>
        <p className="text-sm text-muted-foreground">Analyse der Kundenbeziehungen</p>
      </div>
      <Card className={cn(cardPresetHover, 'gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardContent className="!px-4 !py-4 gap-0">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-8 w-3/4 rounded" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Neue Kunden (30 Tage)</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics?.customerData.newCustomersThisMonth}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Wiederkehrende Kunden</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics?.customerData.returningCustomersRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-secondary">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Durchschnittliche Gruppengröße</p>
                  <p className="text-lg font-bold text-foreground">
                    {analytics?.customerData.averageGroupSize.toFixed(1)} Personen
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BusinessDetails({
  business,
}: {
  business: BusinessAnalytics | null;
}) {
  if (!business) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
          Detaillierte Business-Analyse
        </h3>
        <p className="text-sm text-muted-foreground">
          Ausführliche Statistiken für {business.businessName}
        </p>
      </div>
      <Card className={cn(cardPreset, 'gap-0 !py-0 !px-0 overflow-hidden')}>
        <CardContent className="!px-4 !py-4 gap-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Scans</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                  <p className="text-lg font-bold text-foreground">{business.totalScans}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diese Woche</p>
                  <p className="text-lg font-bold text-foreground">{business.weeklyScans}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Kunden</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Kunden</p>
                  <p className="text-lg font-bold text-foreground">{business.uniqueCustomers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ø Scans/Kunde</p>
                  <p className="text-lg font-bold text-foreground">
                    {business.totalScans / business.uniqueCustomers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
