import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Image as ImageIcon,
  Briefcase,
  Building2,
  Euro,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowLeft,
  Plus,
  Mail,
  Phone,
  Link as LinkIcon,
  Home,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { JobOffer } from '@/models/job-offer';
import { useJobOfferService } from '@/services/jobOfferService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { JobCategory } from '@/models/job-category';
import { getIconComponent } from '@/utils/iconUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

function JobOfferSkeleton() {
  return (
    <Card className={cn(glassCard, 'rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full')}>
      {/* Company logo skeleton */}
      <div className="relative h-48 w-full mb-4">
        <Skeleton className="w-full h-full rounded-t-lg" />
        {/* Badge placeholders */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-12 rounded" />
        </div>
        <div className="absolute top-2 left-2">
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4 rounded" />
            </CardTitle>
            <CardDescription className="mt-1">
              <Skeleton className="h-4 w-32 rounded" />
            </CardDescription>
            {/* Category skeleton */}
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-xl" />
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-3 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

function JobOfferMobileSkeleton() {
  return (
    <Card className={cn(glassCard, 'rounded-2xl p-4')}>
      <div className="flex flex-col gap-2">
        {/* Highlight badge */}
        <Skeleton className="h-6 w-20 rounded mb-2" />

        {/* Company logo */}
        <Skeleton className="w-full h-40 rounded mb-2" />

        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        {/* Date */}
        <Skeleton className="h-3 w-32 rounded mb-1" />

        {/* Description */}
        <div className="space-y-1 mb-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        {/* Details list */}
        <div className="flex flex-col gap-1 mb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))}
        </div>

        {/* Created date */}
        <Skeleton className="h-3 w-40 rounded mb-2" />

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

export function JobOffers() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [homeOfficeFilter, setHomeOfficeFilter] = useState<string>('all');
  const jobOfferService = useJobOfferService();
  const jobCategoryService = useJobCategoryService();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedJobOffers = await jobOfferService.getJobOffers();
      setJobOffers(fetchedJobOffers);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      showUserFriendlyError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    jobCategoryService.getCategories().then(setCategories);
  }, []);

  const handleDelete = async (jobOfferId: string) => {
    try {
      await jobOfferService.deleteJobOffer(jobOfferId);
      showSuccessMessage(toast, {
        title: 'Stellenangebot gelöscht',
        description: 'Das Stellenangebot wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      console.error('Fehler beim Löschen des Stellenangebots:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const filteredJobOffers = jobOffers.filter(jobOffer => {
    const matchesSearch = jobOffer.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || jobOffer.typeOfEmployment === typeFilter;
    const matchesHomeOffice =
      homeOfficeFilter === 'all' ||
      (homeOfficeFilter === 'yes' && jobOffer.homeOffice) ||
      (homeOfficeFilter === 'no' && !jobOffer.homeOffice);

    return matchesSearch && matchesType && matchesHomeOffice;
  });

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          {/* Main Content */}
          <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
            {/* Header Skeleton */}
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <Skeleton className="h-10 w-44 rounded-xl" />
                <Skeleton className="h-8 w-48 rounded" />
                <div className="w-full sm:w-auto sm:ml-auto">
                  <Skeleton className="h-10 w-56 rounded-xl" />
                </div>
              </div>
            </Card>

            {/* Filter Skeleton */}
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg" />
                <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg" />
              </div>
            </Card>

            {/* Mobile Card Skeletons */}
            <div className="block md:hidden space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <JobOfferMobileSkeleton key={index} />
              ))}
            </div>

            {/* Desktop Grid Skeletons */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobOfferSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
          <motion.div
            className={cn(glassCard, 'p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Dashboard
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto text-foreground">
                Stellenangebote
              </h1>
              <div className="w-full sm:w-auto sm:ml-auto">
                <AnimatedButton
                  onClick={() => navigate('/job-offers/create')}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Stellenangebot hinzufügen
                </AnimatedButton>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={cn(glassCard, 'p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="relative flex-1 mb-2 md:mb-0">
                <Input
                  placeholder="Nach Stellenangebot suchen..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(glassInput, 'rounded-lg px-1')}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px] rounded-lg mb-2 md:mb-0')}>
                  <SelectValue placeholder="Beschäftigungsart" />
                </SelectTrigger>
                <SelectContent className={cn(glassCard)}>
                  <SelectItem value="all" className="cursor-pointer">
                    Alle Arten
                  </SelectItem>
                  <SelectItem value="Vollzeit" className="cursor-pointer">
                    Vollzeit
                  </SelectItem>
                  <SelectItem value="Teilzeit" className="cursor-pointer">
                    Teilzeit
                  </SelectItem>
                  <SelectItem value="Ausbildung" className="cursor-pointer">
                    Ausbildung
                  </SelectItem>
                  <SelectItem value="Praktikum" className="cursor-pointer">
                    Praktikum
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={homeOfficeFilter} onValueChange={setHomeOfficeFilter}>
                <SelectTrigger className={cn(glassInput, 'w-full sm:w-[180px] rounded-lg')}>
                  <SelectValue placeholder="Home Office" />
                </SelectTrigger>
                <SelectContent className={cn(glassCard)}>
                  <SelectItem value="all" className="cursor-pointer">
                    Alle Optionen
                  </SelectItem>
                  <SelectItem value="yes" className="cursor-pointer">
                    Mit Home Office
                  </SelectItem>
                  <SelectItem value="no" className="cursor-pointer">
                    Ohne Home Office
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {filteredJobOffers.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'p-8 text-center')}>
                <div className="text-muted-foreground text-lg">Keine Stellenangebote gefunden.</div>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Mobile Card-Ansicht */}
              <motion.div
                className="block md:hidden space-y-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredJobOffers.map((jobOffer, index) => {
                  const category =
                    categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null;
                  return (
                    <motion.div key={jobOffer.id} variants={fadeInUp}>
                      <Card className={cn(glassCard, 'gap-0 !py-0 !px-0 p-4')}>
                        <div className="flex flex-col gap-2">
                          {jobOffer.isHighlight && (
                            <Badge className="w-fit bg-yellow-500 text-white border-yellow-600 mb-2">
                              ⭐ Highlight
                            </Badge>
                          )}
                          {jobOffer.companyLogo && (
                            <img
                              src={jobOffer.companyLogo}
                              alt={jobOffer.title}
                              className="object-contain w-full h-40 rounded bg-muted p-2 mb-2 border border-secondary"
                            />
                          )}
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-lg text-foreground">{jobOffer.title}</span>
                            <Badge
                              variant={jobOffer.homeOffice ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              <Home className="h-4 w-4 mr-1" />
                              {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm mb-1 text-muted-foreground">
                            {category && getIconComponent?.(category.iconName)}
                            {category && <span>{category.name}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {formatDate(jobOffer.startDate)}
                          </div>
                          <div className="text-sm text-foreground mb-2">
                            {jobOffer.generalDescription}
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <div className="flex items-center text-sm text-foreground">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="truncate">{jobOffer.location.address}</span>
                            </div>
                            <div className="flex items-center text-sm text-foreground">
                              <Briefcase className="mr-2 h-4 w-4" />
                              {jobOffer.typeOfEmployment}
                            </div>
                            {jobOffer.wage && (
                              <div className="flex items-center text-sm text-foreground">
                                <Euro className="mr-2 h-4 w-4" />
                                {jobOffer.wage}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-foreground">
                              <Mail className="mr-2 h-4 w-4" />
                              {jobOffer.contactData.email}
                            </div>
                            {jobOffer.contactData.phone && (
                              <div className="flex items-center text-sm text-foreground">
                                <Phone className="mr-2 h-4 w-4" />
                                {jobOffer.contactData.phone}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-foreground">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              <a
                                href={jobOffer.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 hover:underline transition-colors"
                              >
                                Zur Bewerbung
                              </a>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Erstellt am {formatDate(jobOffer.createdAt)}
                          </div>
                          <div className="flex flex-col gap-2 mt-2">
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              className={cn(glassButton, 'w-full')}
                              onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
                            >
                              Bearbeiten
                            </AnimatedButton>
                            <AnimatedButton
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleDelete(jobOffer.id)}
                            >
                              Löschen
                            </AnimatedButton>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
              {/* Desktop/Table Ansicht */}
              <motion.div
                className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredJobOffers.map((jobOffer, index) => (
                  <motion.div key={jobOffer.id} variants={fadeInUp}>
                    <JobOfferCard
                      jobOffer={jobOffer}
                      onDelete={handleDelete}
                      category={categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

interface JobOfferCardProps {
  jobOffer: JobOffer;
  onDelete: (id: string) => void;
  category: JobCategory | null;
}

const JobOfferCard: React.FC<JobOfferCardProps> = ({ jobOffer, onDelete, category }) => {
  const navigate = useNavigate();

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={defaultTransition}>
      <Card className={cn(glassCard, 'flex flex-col gap-0 !py-0 !px-0 overflow-hidden')}>
        {jobOffer.companyLogo ? (
          <div className="relative h-48 w-full">
            <img
              src={jobOffer.companyLogo}
              alt={jobOffer.title}
              className="object-contain w-full h-full bg-muted p-4 border-b border-secondary"
            />
            {jobOffer.images && jobOffer.images.length > 0 && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                <ImageIcon className="mr-1 h-3 w-3" />+{jobOffer.images.length}
              </Badge>
            )}
            {jobOffer.isHighlight && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-white border-yellow-600">
                ⭐ Highlight
              </Badge>
            )}
          </div>
        ) : null}
        <CardHeader className="!px-4 !pt-4 !pb-2 gap-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-foreground">{jobOffer.title}</CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                {formatDate(jobOffer.startDate)}
              </CardDescription>
              {category && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {getIconComponent?.(category.iconName)}
                  <span>{category.name}</span>
                </div>
              )}
            </div>
            <Badge
              variant={jobOffer.homeOffice ? 'default' : 'secondary'}
            >
              <Home className="h-4 w-4 mr-1" />
              {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow !px-4 !py-2 gap-0">
          <p className="text-sm text-foreground line-clamp-3 mb-4">{jobOffer.generalDescription}</p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="truncate">{jobOffer.location.address}</span>
            </div>
            <div className="flex items-center text-sm text-foreground">
              <Briefcase className="mr-2 h-4 w-4" />
              {jobOffer.typeOfEmployment}
            </div>
            {jobOffer.wage && (
              <div className="flex items-center text-sm text-foreground">
                <Euro className="mr-2 h-4 w-4" />
                {jobOffer.wage}
              </div>
            )}
            <div className="flex items-center text-sm text-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {jobOffer.contactData.email}
            </div>
            {jobOffer.contactData.phone && (
              <div className="flex items-center text-sm text-foreground">
                <Phone className="mr-2 h-4 w-4" />
                {jobOffer.contactData.phone}
              </div>
            )}
            <div className="flex items-center text-sm text-foreground">
              <LinkIcon className="mr-2 h-4 w-4" />
              <a
                href={jobOffer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Zur Bewerbung
              </a>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center !px-4 !pt-2 !pb-4 gap-0">
          <div className="text-xs text-muted-foreground">Erstellt am {formatDate(jobOffer.createdAt)}</div>
          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              size="sm"
              className={cn(glassButton)}
              onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
            >
              Bearbeiten
            </AnimatedButton>
            <AnimatedButton
              variant="destructive"
              size="sm"
              onClick={() => onDelete(jobOffer.id)}
            >
              Löschen
            </AnimatedButton>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
