import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBusinessService } from '../services/businessService';
import { useAnalyticsService } from '../services/analyticsService';
import { DashboardAnalytics, BusinessAnalytics } from '../models/business';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Users,
  Scan,
  Euro,
  ArrowLeft,
  Clock,
  Calendar,
  BarChart2,
  RefreshCcw,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { PricingCalculator } from '@/components/PricingCalculator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, cardPresetHover, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

const AnalyticsCard = ({
  icon: Icon,
  title,
  value,
  trend,
  description,
  trendDescription,
  isLoading,
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  trendDescription?: string;
  isLoading?: boolean;
}) => (
  <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
    <Card className={cn(cardPresetHover, 'gap-0 !py-0 !px-0 overflow-hidden')}>
      <CardHeader className="!px-4 !pt-4 !pb-2 border-b border-secondary gap-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(cardPreset, 'p-2')}>
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
          </div>
          {trend !== undefined && !isLoading && (
            <div
              className={`flex items-center ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="!px-4 !py-4 gap-0">
        <div className="space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-24 rounded" />
              {description && <Skeleton className="h-4 w-32 rounded" />}
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              {trendDescription && (
                <p className="text-xs text-muted-foreground">{trendDescription}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BusinessAnalyticsCard = ({
  business,
  isLoading,
}: {
  business: BusinessAnalytics;
  isLoading?: boolean;
}) => (
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
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(business.totalScans / business.yearlyScans) * 100}%` }}
              ></div>
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

const TimeAnalysisCard = ({
  analytics,
  isLoading,
}: {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
}) => (
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

const CustomerRetentionCard = ({
  analytics,
  isLoading,
}: {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
}) => (
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

const BusinessDetails = ({
  business,
  isLoading,
}: {
  business: BusinessAnalytics | null;
  isLoading: boolean;
}) => {
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
};

export function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const businessService = useBusinessService();
  const analyticsService = useAnalyticsService();
  const isInitialMount = useRef(true);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const customerScans = await businessService.getCustomerScans();
      const analytics = analyticsService.calculateDashboardAnalytics(customerScans);
      setAnalytics(analytics);
    } catch (error) {
      console.error('Fehler beim Laden der Analytics:', error);
      showUserFriendlyError(error, toast, () => loadAnalytics(), 'load-analytics');
    } finally {
      setIsLoading(false);
    }
  }, [businessService, analyticsService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchAnalytics();
    }
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Glass Header */}
          <motion.div
            className={cn(cardPreset, 'p-4 sm:p-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Detaillierte Einblicke in die Performance deiner Partner
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <LoadingButton
                  variant="outline"
                  onClick={fetchAnalytics}
                  disabled={isLoading}
                  className={cn(buttonPreset)}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Aktualisieren
                </LoadingButton>
                <LoadingButton
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className={cn(buttonPreset, 'rounded-full')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück</span>
                </LoadingButton>
              </div>
            </div>
          </motion.div>

          {/* Overview Cards */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Übersicht</h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnalyticsCard
                icon={Scan}
                title="Gesamtscans"
                value={analytics?.totalScans || 0}
                trend={analytics?.monthlyTrend}
                description={`${analytics?.customerData.total || 0} unique Kunden`}
                trendDescription="Veränderung zum Vormonat"
                isLoading={isLoading}
              />
              <AnalyticsCard
                icon={Euro}
                title="Umsatz (30 Tage)"
                value={`${analytics?.revenueData.monthly.toFixed(2) || '0'}€`}
                description={`${analytics?.revenueData.weekly.toFixed(2) || '0'}€ diese Woche`}
                isLoading={isLoading}
              />
              <AnalyticsCard
                icon={UserCheck}
                title="Kundenbindung"
                value={`${analytics?.customerData.returningCustomersRate.toFixed(1) || '0'}%`}
                description={`${analytics?.customerData.newCustomersThisMonth || 0} neue Kunden diesen Monat`}
                isLoading={isLoading}
              />
              <motion.div variants={fadeInUp}>
                <AnalyticsCard
                  icon={Store}
                  title="Scans pro Partner"
                  value={(analytics?.averageScansPerBusiness || 0).toFixed(1)}
                  trend={analytics?.weeklyTrend}
                  description={`${analytics?.businesses.length || 0} aktive Partner`}
                  isLoading={isLoading}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Revenue Overview */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Umsatzübersicht</h2>
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                Umsatzverteilung
              </h3>
              <p className="text-sm text-muted-foreground">Einnahmen über verschiedene Zeiträume</p>
            </div>
            <Card className={cn(cardPreset, 'gap-0 !py-0 !px-0 overflow-hidden mb-6')}>
              <CardContent className="!px-4 !py-4 gap-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Diese Woche</p>
                      <p className="text-2xl font-bold text-foreground">
                        {analytics?.revenueData.weekly.toFixed(2) || '0'}€
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Dieser Monat</p>
                      <p className="text-2xl font-bold text-foreground">
                        {analytics?.revenueData.monthly.toFixed(2) || '0'}€
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Dieses Jahr</p>
                      <p className="text-2xl font-bold text-foreground">
                        {analytics?.revenueData.yearly.toFixed(2) || '0'}€
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ø pro Scan</p>
                      <p className="text-2xl font-bold text-foreground">
                        {analytics?.revenueData.averagePerScan.toFixed(2) || '0'}€
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Analytics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <TimeAnalysisCard analytics={analytics} isLoading={isLoading} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <CustomerRetentionCard analytics={analytics} isLoading={isLoading} />
            </motion.div>
          </motion.div>

          {/* Top Performing Businesses */}
          <motion.div variants={fadeInUp}>
            <Card className={cn(cardPreset, 'p-4 mb-6')}>
              <h2 className="text-2xl font-bold text-foreground">Top Partner</h2>
            </Card>
            {isLoading ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <BusinessAnalyticsCard business={{} as BusinessAnalytics} isLoading={true} />
                  </motion.div>
                ))}
              </motion.div>
            ) : analytics?.topBusinesses && analytics.topBusinesses.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {analytics.topBusinesses.map((business, index) => (
                  <motion.div key={business.businessName} variants={fadeInUp}>
                    <BusinessAnalyticsCard business={business} isLoading={false} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card className={cn(cardPreset, 'py-8 px-4')}>
                <p className="text-center text-muted-foreground">
                  Noch keine Partner-Daten verfügbar
                </p>
              </Card>
            )}
          </motion.div>

          {/* Pricing Calculator */}
          {!isLoading && analytics?.businesses && (
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Preiskalkulator</h2>
              <Card className={cn(cardPreset, 'gap-0 !py-0 !px-0 overflow-hidden')}>
                <CardContent className="!px-4 !py-4 gap-0">
                  <PricingCalculator analytics={analytics.businesses} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* New Business Selection and Details Section */}
          <motion.div className="space-y-4" variants={fadeInUp}>
            <Card className={cn(cardPreset, 'p-4')}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">Business-Details</h2>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger className={cn(inputPreset, 'w-full sm:w-[200px]')}>
                    <SelectValue placeholder="Business auswählen" />
                  </SelectTrigger>
                  <SelectContent className={cn(cardPreset)}>
                    {analytics?.businesses?.map(business => (
                      <SelectItem
                        key={business.businessName}
                        value={business.businessName}
                        className="cursor-pointer"
                      >
                        {business.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {selectedBusiness && analytics?.businesses && (
              <BusinessDetails
                business={
                  analytics.businesses.find(b => b.businessName === selectedBusiness) || null
                }
                isLoading={isLoading}
              />
            )}
          </motion.div>

          {/* Existing business cards */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              Alle Partner-Analysen
            </h2>
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {analytics?.businesses.map((business, index) => (
                <motion.div key={business.businessName} variants={fadeInUp}>
                  <BusinessAnalyticsCard business={business} isLoading={isLoading} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
