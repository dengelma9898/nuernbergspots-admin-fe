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
import { Button } from '@/components/ui/button';
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
  <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-3xl">
    <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 backdrop-blur-2xl bg-white/20 rounded-lg border border-white/30">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>
        {trend !== undefined && !isLoading && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
    <div className="p-4">
      <div className="space-y-1">
        {isLoading ? (
          <>
            <div className="h-8 w-24 backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
            {description && (
              <div className="h-4 w-32 backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
            )}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-white">{value}</div>
            {description && <p className="text-sm text-white/70">{description}</p>}
            {trendDescription && <p className="text-xs text-white/60">{trendDescription}</p>}
          </>
        )}
      </div>
    </div>
  </div>
);

const BusinessAnalyticsCard = ({
  business,
  isLoading,
}: {
  business: BusinessAnalytics;
  isLoading?: boolean;
}) => (
  <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-3xl">
    <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        {isLoading ? (
          <div className="h-6 w-32 backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
        ) : (
          <>
            <h3 className="text-sm font-medium text-white">{business.businessName}</h3>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-white/70" />
              <span className="text-sm text-white/70">{business.uniqueCustomers}</span>
            </div>
          </>
        )}
      </div>
    </div>
    <div className="p-4">
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          <div className="h-2 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
            <div className="h-8 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
            <div className="h-8 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Gesamtscans</span>
            <span className="font-medium text-white">{business.totalScans}</span>
          </div>
          <div className="backdrop-blur-2xl bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
              style={{ width: `${(business.totalScans / business.yearlyScans) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
            <div>
              <div className="font-medium text-white">{business.weeklyScans}</div>
              Woche
            </div>
            <div>
              <div className="font-medium text-white">{business.monthlyScans}</div>
              Monat
            </div>
            <div>
              <div className="font-medium text-white">{business.yearlyScans}</div>
              Jahr
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-white/70">
            <div>
              <span>Ø Preis:</span>
              <span className="ml-1 font-medium text-white">
                {business.averagePrice.toFixed(2)}€
              </span>
            </div>
            <div>
              <span>Ø Personen:</span>
              <span className="ml-1 font-medium text-white">
                {business.averageNumberOfPeople.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>
              <div className="font-medium text-white">
                {business.customerRetention.returningCustomers}
              </div>
              Stammkunden
            </div>
            <div>
              <div className="font-medium text-white">
                {business.customerRetention.retentionRate.toFixed(1)}%
              </div>
              Treue-Rate
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 text-xs text-white/70">
            <div className="mb-1">Beliebteste Zeiten:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-white">{business.peakTimes.dayOfWeek}</span>
                <span className="block">Tag</span>
              </div>
              <div>
                <span className="font-medium text-white">{business.peakTimes.timeOfDay}</span>
                <span className="block">Uhrzeit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const TimeAnalysisCard = ({
  analytics,
  isLoading,
}: {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
}) => (
  <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-3xl">
    <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
      <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
        Zeitanalyse
      </h3>
      <p className="text-white/70">Besuchermuster und Stoßzeiten</p>
    </div>
    <div className="p-4">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-20 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
            <div className="h-16 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-white">Beliebteste Tage</h4>
              <div className="space-y-1">
                {analytics?.timeAnalysis.peakDays.slice(0, 3).map((day, index) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">{day}</span>
                    <span className="font-medium">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-white">Stoßzeiten</h4>
              <div className="space-y-1">
                {analytics?.timeAnalysis.peakHours.slice(0, 3).map((hour, index) => (
                  <div key={hour} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">{hour} Uhr</span>
                    <span className="font-medium">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Durchschnittliche Besuche pro Tag</h4>
              <span className="text-lg font-bold text-white">
                {analytics?.categoryAnalysis.averageVisitsPerDay.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const CustomerRetentionCard = ({
  analytics,
  isLoading,
}: {
  analytics: DashboardAnalytics | null;
  isLoading: boolean;
}) => (
  <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-3xl">
    <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
      <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
        Kundenbindung
      </h3>
      <p className="text-white/70">Analyse der Kundenbeziehungen</p>
    </div>
    <div className="p-4">
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
            <div className="h-16 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
          <div className="h-8 w-3/4 backdrop-blur-2xl bg-white/10 rounded animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-white/70">Neue Kunden (30 Tage)</p>
              <p className="text-2xl font-bold text-white">
                {analytics?.customerData.newCustomersThisMonth}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-white/70">Wiederkehrende Kunden</p>
              <p className="text-2xl font-bold text-white">
                {analytics?.customerData.returningCustomersRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/70">Durchschnittliche Gruppengröße</p>
              <p className="text-lg font-bold text-white">
                {analytics?.customerData.averageGroupSize.toFixed(1)} Personen
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
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
    <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
      <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
          Detaillierte Business-Analyse
        </h3>
        <p className="text-white/70">Ausführliche Statistiken für {business.businessName}</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-white">Scans</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-white/70">Gesamt</p>
                <p className="text-lg font-bold text-white">{business.totalScans}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Diese Woche</p>
                <p className="text-lg font-bold text-white">{business.weeklyScans}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-white">Kunden</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-white/70">Unique Kunden</p>
                <p className="text-lg font-bold text-white">{business.uniqueCustomers}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Ø Scans/Kunde</p>
                <p className="text-lg font-bold text-white">
                  {business.totalScans / business.uniqueCustomers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1000ms' }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '500ms' }}
      ></div>
      <div
        className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '700ms' }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '300ms' }}
      ></div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <div className="space-y-8">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-base sm:text-lg text-white/80">
                  Detaillierte Einblicke in die Performance deiner Partner
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={fetchAnalytics}
                  disabled={isLoading}
                  className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Aktualisieren
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div>
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 mb-6">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Übersicht
              </h2>
            </div>
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
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 mb-6">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Umsatzübersicht
              </h2>
            </div>
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden mb-6">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Umsatzverteilung
                </h3>
                <p className="text-white/70">Einnahmen über verschiedene Zeiträume</p>
              </div>
              <div className="p-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 w-full backdrop-blur-2xl bg-white/10 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white/70">Diese Woche</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.revenueData.weekly.toFixed(2) || '0'}€
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/70">Dieser Monat</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.revenueData.monthly.toFixed(2) || '0'}€
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/70">Dieses Jahr</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.revenueData.yearly.toFixed(2) || '0'}€
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/70">Ø pro Scan</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.revenueData.averagePerScan.toFixed(2) || '0'}€
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TimeAnalysisCard analytics={analytics} isLoading={isLoading} />
            <CustomerRetentionCard analytics={analytics} isLoading={isLoading} />
          </div>

          {/* Top Performing Businesses */}
          <div>
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 mb-6">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Top Partner
              </h2>
            </div>
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
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="py-8 px-4">
                  <p className="text-center text-white/70">Noch keine Partner-Daten verfügbar</p>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Calculator */}
          {!isLoading && analytics?.businesses && (
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Preiskalkulator
                </h2>
              </div>
              <div className="p-4">
                <PricingCalculator analytics={analytics.businesses} />
              </div>
            </div>
          )}

          {/* New Business Selection and Details Section */}
          <div className="space-y-4">
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Business-Details
                </h2>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger className="w-full sm:w-[200px] backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Business auswählen" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-3xl bg-black/80 border-white/20">
                    {analytics?.businesses?.map(business => (
                      <SelectItem
                        key={business.businessName}
                        value={business.businessName}
                        className="text-white hover:bg-white/20"
                      >
                        {business.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedBusiness && analytics?.businesses && (
              <BusinessDetails
                business={
                  analytics.businesses.find(b => b.businessName === selectedBusiness) || null
                }
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Existing business cards */}
          <div>
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 mb-6">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Alle Partner-Analysen
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics?.businesses.map(business => (
                <BusinessAnalyticsCard
                  key={business.businessName}
                  business={business}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
