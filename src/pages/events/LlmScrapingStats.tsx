import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, Database, Loader2 } from 'lucide-react';
import { useEventService } from '@/services/eventService';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const LlmScrapingStats: React.FC = () => {
  const navigate = useNavigate();
  const eventService = useEventService();
  const [costs, setCosts] = useState<{
    costs: Record<string, number>;
    total: number;
    currency: string;
  }>({ costs: {}, total: 0, currency: 'USD' });
  const [tokens, setTokens] = useState<{
    usage: Record<string, { input: number; output: number }>;
    totals: {
      input: number;
      output: number;
      total: number;
    };
  }>({
    usage: {},
    totals: { input: 0, output: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [costsData, tokensData] = await Promise.all([
        eventService.getLlmScrapingCosts(),
        eventService.getLlmScrapingTokens(),
      ]);
      setCosts(costsData);
      setTokens(tokensData);
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
      showUserFriendlyError(error, toast, () => loadStats(), 'load-stats');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('de-DE').format(value);
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
            <div className="flex flex-row items-center gap-4">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/events/scraper')}
                className={cn(glassButton, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Event Scraper</span>
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                LLM Scraping Statistiken
              </h1>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Costs Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn(glassCard, 'p-3')}>
                      <DollarSign className="h-6 w-6 text-foreground" />
                    </div>
                    <CardTitle className="text-foreground">Monatliche Kosten</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(costs.costs).length > 0 ? (
                        Object.entries(costs.costs).map(([model, cost]) => (
                          <div
                            key={model}
                            className={cn(glassCard, 'p-4 flex items-center justify-between')}
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{model}</p>
                              <p className="text-xs text-muted-foreground">Gesamtkosten</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(cost, costs.currency)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Keine Modell-Kosten vorhanden</p>
                        </div>
                      )}
                      <div className={cn(glassCard, 'p-4 mt-4 border-t border-secondary')}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">Gesamt</p>
                          <p className="text-xl font-bold text-foreground">
                            {formatCurrency(costs.total, costs.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tokens Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn(glassCard, 'p-3')}>
                      <Database className="h-6 w-6 text-foreground" />
                    </div>
                    <CardTitle className="text-foreground">Token-Verbrauch</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(tokens.usage).length > 0 ? (
                        Object.entries(tokens.usage).map(([model, tokenData]) => (
                          <div key={model} className={cn(glassCard, 'p-4')}>
                            <p className="text-sm font-medium text-foreground mb-3">{model}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Input Tokens</span>
                                <span className="text-sm font-semibold text-foreground">
                                  {formatNumber(tokenData.input)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Output Tokens</span>
                                <span className="text-sm font-semibold text-foreground">
                                  {formatNumber(tokenData.output)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-secondary">
                                <span className="text-xs font-medium text-foreground">Gesamt</span>
                                <span className="text-sm font-bold text-foreground">
                                  {formatNumber(tokenData.input + tokenData.output)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Keine Modell-Token-Daten vorhanden</p>
                        </div>
                      )}
                      <div className={cn(glassCard, 'p-4 mt-4 border-t border-secondary')}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">Gesamt Input</p>
                            <p className="text-sm font-bold text-foreground">
                              {formatNumber(tokens.totals.input)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">Gesamt Output</p>
                            <p className="text-sm font-bold text-foreground">
                              {formatNumber(tokens.totals.output)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-secondary">
                            <p className="text-sm font-semibold text-foreground">Gesamt</p>
                            <p className="text-lg font-bold text-foreground">
                              {formatNumber(tokens.totals.total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Refresh Button */}
          <motion.div
            className="mt-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <AnimatedButton
              onClick={loadStats}
              disabled={loading}
              className={cn(glassButton)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird geladen...
                </>
              ) : (
                'Aktualisieren'
              )}
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
