import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { Business, BusinessStatus } from '@/models/business';
import { useBusinessService } from '@/services/businessService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BusinessCategory } from '@/models/business-category';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { BusinessCard } from '@/components/businesses/BusinessCard';
import { BusinessCardSkeleton } from '@/components/businesses/BusinessCardSkeleton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

export const BusinessList: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [showOnlyWithoutReview, setShowOnlyWithoutReview] = useState(false);
  const [showOnlyPendingPartners, setShowOnlyPendingPartners] = useState(false);
  const businessService = useBusinessService();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryService = useBusinessCategoryService();
  const [categories, setCategories] = useState<BusinessCategory[]>([]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const fetchedBusinesses = await businessService.getBusinesses();
      setBusinesses(fetchedBusinesses);
    } catch (error) {
      console.error('Fehler beim Laden der Geschäfte:', error);
      showUserFriendlyError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'pending') {
      setShowOnlyPendingPartners(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showOnlyPendingPartners) {
      setSearchParams({ filter: 'pending' });
    } else {
      setSearchParams({});
    }
  }, [showOnlyPendingPartners, setSearchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
        showUserFriendlyError(error, toast);
      }
    };
    loadCategories();
  }, []);

  const handleDelete = async (businessId: string) => {
    try {
      await businessService.deleteBusiness(businessId);
      toast.success('Geschäft gelöscht', {
        description: 'Das Geschäft wurde erfolgreich gelöscht.',
      });
      loadBusinesses();
    } catch (error) {
      console.error('Fehler beim Löschen des Geschäfts:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const handleEditClick = (business: Business) => {
    navigate(`/businesses/${business.id}/edit`);
  };

  const getCategoryNames = (categoryIds: string[]) => {
    if (!Array.isArray(categoryIds) || !categories || categories.length === 0) {
      return '–';
    }
    return categoryIds
      .map(id => categories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <div className="relative z-10 container mx-auto py-6">
            {/* Header Skeleton */}
            <div className={cn(glassCard, 'p-6 mb-8')}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-8 w-32 rounded" />
                </div>
                <Skeleton className="h-9 w-full sm:w-40 rounded-xl" />
              </div>
            </div>

            {/* Filter Section Skeleton */}
            <div className={cn(glassCard, 'p-6 mb-8')}>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className={cn(glassCard, 'p-3')}>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-5 w-9 rounded-full" />
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>

            {/* Business Cards Skeleton */}
            <div className="space-y-8">
              <div className={cn(glassCard, 'p-6')}>
                <div className="flex items-center mb-6">
                  <Skeleton className="h-6 w-6 rounded mr-3" />
                  <Skeleton className="h-6 w-48 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }, (_, index) => (
                    <BusinessCardSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPendingFilter = !showOnlyPending || business.status === BusinessStatus.PENDING;
    const matchesReviewFilter =
      !showOnlyWithoutReview || !business.nuernbergspotsReview?.reviewText;
    const matchesPendingPartnersFilter =
      !showOnlyPendingPartners ||
      (business.status === BusinessStatus.PENDING && business.hasAccount === true);

    return (
      matchesSearch && matchesPendingFilter && matchesReviewFilter && matchesPendingPartnersFilter
    );
  });

  const activeBusinesses = filteredBusinesses.filter(b => b.status === BusinessStatus.ACTIVE);
  const pendingBusinesses = filteredBusinesses.filter(b => b.status === BusinessStatus.PENDING);
  const inactiveBusinesses = filteredBusinesses.filter(b => b.status === BusinessStatus.INACTIVE);

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className={cn(glassButton, 'rounded-full')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zum Dashboard</span>
                </AnimatedButton>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Geschäfte
                </h1>
              </div>
              <AnimatedButton
                onClick={() => navigate('/create-business')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Partner hinzufügen
              </AnimatedButton>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="space-y-4">
              <Input
                placeholder="Nach Geschäftsnamen suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(glassInput)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={cn(glassCard, 'p-3')}>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="pending-filter"
                      checked={showOnlyPending}
                      onCheckedChange={setShowOnlyPending}
                    />
                    <Label htmlFor="pending-filter" className="text-foreground text-sm">
                      Nur ausstehende
                    </Label>
                  </div>
                </div>
                <div className={cn(glassCard, 'p-3')}>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="review-filter"
                      checked={showOnlyWithoutReview}
                      onCheckedChange={setShowOnlyWithoutReview}
                    />
                    <Label htmlFor="review-filter" className="text-foreground text-sm">
                      Ohne Review
                    </Label>
                  </div>
                </div>
                <div className={cn(glassCard, 'p-3')}>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="pending-partners-filter"
                      checked={showOnlyPendingPartners}
                      onCheckedChange={setShowOnlyPendingPartners}
                    />
                    <Label htmlFor="pending-partners-filter" className="text-foreground text-sm">
                      Ausstehende Partner mit Konto
                    </Label>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredBusinesses.length} Geschäfte gefunden
              </div>
            </div>
          </motion.div>

          {/* Business Sections */}
          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {activeBusinesses.length > 0 && (
              <motion.div variants={fadeInUp} className={cn(glassCard, 'p-6')}>
                <h2 className="text-xl font-semibold mb-6 flex items-center text-foreground">
                  <CheckCircle2 className="mr-3 h-6 w-6 text-green-600 dark:text-green-400" />
                  Aktive Geschäfte ({activeBusinesses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBusinesses.map((business, index) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      categoryNames={getCategoryNames(business.categoryIds)}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {pendingBusinesses.length > 0 && (
              <motion.div variants={fadeInUp} className={cn(glassCard, 'p-6')}>
                <h2 className="text-xl font-semibold mb-6 flex items-center text-foreground">
                  <AlertCircle className="mr-3 h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  Ausstehende Partner ({pendingBusinesses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingBusinesses.map((business, index) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      categoryNames={getCategoryNames(business.categoryIds)}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {inactiveBusinesses.length > 0 && (
              <motion.div variants={fadeInUp} className={cn(glassCard, 'p-6')}>
                <h2 className="text-xl font-semibold mb-6 flex items-center text-foreground">
                  <XCircle className="mr-3 h-6 w-6 text-red-600 dark:text-red-400" />
                  Inaktive Partner ({inactiveBusinesses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveBusinesses.map((business, index) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      categoryNames={getCategoryNames(business.categoryIds)}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {filteredBusinesses.length === 0 && (
              <motion.div
                variants={fadeInUp}
                className={cn(glassCard, 'p-8 text-center')}
              >
                <div className="text-muted-foreground text-lg">Keine Partner gefunden.</div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
