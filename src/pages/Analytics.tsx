import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBusinessService } from '../services/businessService';
import { useAnalyticsService } from '../services/analyticsService';
import { DashboardAnalytics, BusinessAnalytics } from '../models/business';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  UserCheck
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { PricingCalculator } from "@/components/PricingCalculator";

const AnalyticsCard = ({ 
  icon: Icon,
  title,
  value,
  trend,
  description,
  trendDescription,
  isLoading
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  trendDescription?: string;
  isLoading?: boolean;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {trend !== undefined && !isLoading && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            {description && <Skeleton className="h-4 w-32" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trendDescription && (
              <p className="text-xs text-muted-foreground">{trendDescription}</p>
            )}
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

const BusinessAnalyticsCard = ({ business, isLoading }: { business: BusinessAnalytics, isLoading?: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        {isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : (
          <>
            <CardTitle className="text-sm font-medium">{business.businessName}</CardTitle>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{business.uniqueCustomers}</span>
            </div>
          </>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gesamtscans</span>
            <span className="font-medium">{business.totalScans}</span>
          </div>
          <Progress value={(business.totalScans / business.yearlyScans) * 100} className="h-2" />
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
          <div className="pt-2 border-t flex justify-between text-xs text-muted-foreground">
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
          <div className="pt-2 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
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
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <div className="mb-1">Beliebteste Zeiten:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-foreground">{business.peakTimes.dayOfWeek}</span>
                <span className="block">Tag</span>
              </div>
              <div>
                <span className="font-medium text-foreground">{business.peakTimes.timeOfDay}</span>
                <span className="block">Uhrzeit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const TimeAnalysisCard = ({ analytics, isLoading }: { analytics: DashboardAnalytics | null, isLoading: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Zeitanalyse</CardTitle>
      <CardDescription>Besuchermuster und Stoßzeiten</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Beliebteste Tage</h4>
              <div className="space-y-1">
                {analytics?.timeAnalysis.peakDays.slice(0, 3).map((day, index) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-medium">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Stoßzeiten</h4>
              <div className="space-y-1">
                {analytics?.timeAnalysis.peakHours.slice(0, 3).map((hour, index) => (
                  <div key={hour} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{hour} Uhr</span>
                    <span className="font-medium">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Durchschnittliche Besuche pro Tag</h4>
              <span className="text-lg font-bold">
                {analytics?.categoryAnalysis.averageVisitsPerDay.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const CustomerRetentionCard = ({ analytics, isLoading }: { analytics: DashboardAnalytics | null, isLoading: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Kundenbindung</CardTitle>
      <CardDescription>Analyse der Kundenbeziehungen</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Neue Kunden (30 Tage)</p>
              <p className="text-2xl font-bold">{analytics?.customerData.newCustomersThisMonth}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Wiederkehrende Kunden</p>
              <p className="text-2xl font-bold">
                {analytics?.customerData.returningCustomersRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Durchschnittliche Gruppengröße</p>
              <p className="text-lg font-bold">
                {analytics?.customerData.averageGroupSize.toFixed(1)} Personen
              </p>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const businessService = useBusinessService();
  const analyticsService = useAnalyticsService();
  const isInitialMount = useRef(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const customerScans = await businessService.getCustomerScans();
      const analytics = analyticsService.calculateDashboardAnalytics(customerScans);
      setAnalytics(analytics);
    } catch (error) {
      console.error('Fehler beim Laden der Analytics:', error);
      toast.error('Die Analytics konnten nicht geladen werden.');
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
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Detaillierte Einblicke in die Performance deiner Partner
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Übersicht</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <AnalyticsCard
              icon={Store}
              title="Scans pro Partner"
              value={(analytics?.averageScansPerBusiness || 0).toFixed(1)}
              trend={analytics?.weeklyTrend}
              description={`${analytics?.businesses.length || 0} aktive Partner`}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Revenue Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Umsatzübersicht</h2>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Umsatzverteilung</CardTitle>
              <CardDescription>Einnahmen über verschiedene Zeiträume</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Diese Woche</p>
                    <p className="text-2xl font-bold">{analytics?.revenueData.weekly.toFixed(2) || '0'}€</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dieser Monat</p>
                    <p className="text-2xl font-bold">{analytics?.revenueData.monthly.toFixed(2) || '0'}€</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dieses Jahr</p>
                    <p className="text-2xl font-bold">{analytics?.revenueData.yearly.toFixed(2) || '0'}€</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ø pro Scan</p>
                    <p className="text-2xl font-bold">{analytics?.revenueData.averagePerScan.toFixed(2) || '0'}€</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TimeAnalysisCard analytics={analytics} isLoading={isLoading} />
          <CustomerRetentionCard analytics={analytics} isLoading={isLoading} />
        </div>

        {/* Top Performing Businesses */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Partner</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <BusinessAnalyticsCard
                  key={i}
                  business={{} as BusinessAnalytics}
                  isLoading={true}
                />
              ))}
            </div>
          ) : analytics?.topBusinesses && analytics.topBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.topBusinesses.map(business => (
                <BusinessAnalyticsCard
                  key={business.businessName}
                  business={business}
                  isLoading={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  Noch keine Partner-Daten verfügbar
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pricing Calculator */}
        {!isLoading && analytics?.businesses && (
          <PricingCalculator analytics={analytics.businesses} />
        )}
      </div>
    </div>
  );
} 