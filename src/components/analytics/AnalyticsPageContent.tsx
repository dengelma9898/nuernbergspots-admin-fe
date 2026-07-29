import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingButton } from '@/components/LoadingButton';
import { PricingCalculator } from '@/components/PricingCalculator';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsOverviewCard } from '@/components/analytics/AnalyticsOverviewCard';
import {
  BusinessAnalyticsCard,
  BusinessDetails,
  CustomerRetentionCard,
  TimeAnalysisCard,
} from '@/components/analytics/AnalyticsDetailCards';
import { ArrowLeft, Euro, RefreshCcw, Scan, Store, UserCheck } from 'lucide-react';

export function AnalyticsPageContent() {
  const navigate = useNavigate();
  const { analytics, isLoading, selectedBusiness, setSelectedBusiness, fetchAnalytics } =
    useAnalyticsData();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
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

          <motion.div variants={fadeInUp}>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Übersicht</h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnalyticsOverviewCard
                icon={Scan}
                title="Gesamtscans"
                value={analytics?.totalScans || 0}
                trend={analytics?.monthlyTrend}
                description={`${analytics?.customerData.total || 0} unique Kunden`}
                trendDescription="Veränderung zum Vormonat"
                isLoading={isLoading}
              />
              <AnalyticsOverviewCard
                icon={Euro}
                title="Umsatz (30 Tage)"
                value={`${analytics?.revenueData.monthly.toFixed(2) || '0'}€`}
                description={`${analytics?.revenueData.weekly.toFixed(2) || '0'}€ diese Woche`}
                isLoading={isLoading}
              />
              <AnalyticsOverviewCard
                icon={UserCheck}
                title="Kundenbindung"
                value={`${analytics?.customerData.returningCustomersRate.toFixed(1) || '0'}%`}
                description={`${analytics?.customerData.newCustomersThisMonth || 0} neue Kunden diesen Monat`}
                isLoading={isLoading}
              />
              <motion.div variants={fadeInUp}>
                <AnalyticsOverviewCard
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
                    <BusinessAnalyticsCard business={{} as never} isLoading={true} />
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
                {analytics.topBusinesses.map(business => (
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
              />
            )}
          </motion.div>

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
              {analytics?.businesses.map(business => (
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
