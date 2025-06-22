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
import { Button } from '@/components/ui/button';
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

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

function JobOfferSkeleton() {
  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full ring-1 ring-white/30">
      {/* Company logo skeleton */}
      <div className="relative h-48 w-full mb-4">
        <Skeleton className="w-full h-full rounded-t-lg bg-white/10 backdrop-blur-xl" />
        {/* Badge placeholders */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-12 rounded bg-white/10 backdrop-blur-xl" />
        </div>
        <div className="absolute top-2 left-2">
          <Skeleton className="h-6 w-20 rounded bg-white/10 backdrop-blur-xl" />
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4 bg-white/10 backdrop-blur-xl rounded" />
            </CardTitle>
            <CardDescription className="mt-1">
              <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
            </CardDescription>
            {/* Category skeleton */}
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="h-4 w-4 rounded bg-white/10 backdrop-blur-xl" />
              <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-xl bg-white/10 backdrop-blur-xl" />
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-4 w-4/5 bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-4 w-3/5 bg-white/10 backdrop-blur-xl rounded" />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-40 bg-white/10 backdrop-blur-xl rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-20 bg-white/10 backdrop-blur-xl rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-36 bg-white/10 backdrop-blur-xl rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-28 bg-white/10 backdrop-blur-xl rounded" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Skeleton className="h-3 w-32 bg-white/10 backdrop-blur-xl rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl bg-white/10 backdrop-blur-xl" />
          <Skeleton className="h-8 w-16 rounded-xl bg-white/10 backdrop-blur-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

function JobOfferMobileSkeleton() {
  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-2xl p-4 ring-1 ring-white/30">
      <div className="flex flex-col gap-2">
        {/* Highlight badge */}
        <Skeleton className="h-6 w-20 rounded bg-white/10 backdrop-blur-xl mb-2" />

        {/* Company logo */}
        <Skeleton className="w-full h-40 rounded bg-white/10 backdrop-blur-xl mb-2" />

        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-3/4 bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-6 w-20 rounded bg-white/10 backdrop-blur-xl" />
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-4 w-4 rounded bg-white/10 backdrop-blur-xl" />
          <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
        </div>

        {/* Date */}
        <Skeleton className="h-3 w-32 bg-white/10 backdrop-blur-xl rounded mb-1" />

        {/* Description */}
        <div className="space-y-1 mb-2">
          <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
          <Skeleton className="h-4 w-2/3 bg-white/10 backdrop-blur-xl rounded" />
        </div>

        {/* Details list */}
        <div className="flex flex-col gap-1 mb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2 rounded bg-white/10 backdrop-blur-xl" />
              <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
            </div>
          ))}
        </div>

        {/* Created date */}
        <Skeleton className="h-3 w-40 bg-white/10 backdrop-blur-xl rounded mb-2" />

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <Skeleton className="h-9 w-full rounded-xl bg-white/10 backdrop-blur-xl" />
          <Skeleton className="h-9 w-full rounded-xl bg-white/10 backdrop-blur-xl" />
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
      toast.error('Fehler beim Laden der Daten', {
        description:
          'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
      });
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
      toast.success('Stellenangebot gelöscht', {
        description: 'Das Stellenangebot wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      toast.error('Fehler beim Löschen', {
        description:
          'Das Stellenangebot konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.',
      });
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
          {/* Header Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
              <Skeleton className="h-10 w-44 rounded-xl bg-white/10 backdrop-blur-xl" />
              <Skeleton className="h-8 w-48 bg-white/10 backdrop-blur-xl rounded" />
              <div className="w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-10 w-56 rounded-xl bg-white/10 backdrop-blur-xl" />
              </div>
            </div>
          </div>

          {/* Filter Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Skeleton className="h-10 flex-1 rounded-lg bg-white/10 backdrop-blur-xl" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg bg-white/10 backdrop-blur-xl" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg bg-white/10 backdrop-blur-xl" />
            </div>
          </div>

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
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden relative z-10">
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
              Stellenangebote
            </h1>
            <div className="w-full sm:w-auto sm:ml-auto">
              <Button
                onClick={() => navigate('/job-offers/create')}
                className="w-full sm:w-auto backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Stellenangebot hinzufügen
              </Button>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="relative flex-1 mb-2 md:mb-0">
              <Input
                placeholder="Nach Stellenangebot suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-lg px-1 backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-lg mb-2 md:mb-0 backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Beschäftigungsart" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/20">
                  Alle Arten
                </SelectItem>
                <SelectItem value="Vollzeit" className="text-white hover:bg-white/20">
                  Vollzeit
                </SelectItem>
                <SelectItem value="Teilzeit" className="text-white hover:bg-white/20">
                  Teilzeit
                </SelectItem>
                <SelectItem value="Ausbildung" className="text-white hover:bg-white/20">
                  Ausbildung
                </SelectItem>
                <SelectItem value="Praktikum" className="text-white hover:bg-white/20">
                  Praktikum
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={homeOfficeFilter} onValueChange={setHomeOfficeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-lg backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Home Office" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-3xl bg-white/10 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/20">
                  Alle Optionen
                </SelectItem>
                <SelectItem value="yes" className="text-white hover:bg-white/20">
                  Mit Home Office
                </SelectItem>
                <SelectItem value="no" className="text-white hover:bg-white/20">
                  Ohne Home Office
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredJobOffers.length === 0 ? (
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 text-center">
            <div className="text-white/90 text-lg">Keine Stellenangebote gefunden.</div>
          </div>
        ) : (
          <>
            {/* Mobile Card-Ansicht */}
            <div className="block md:hidden space-y-6">
              {filteredJobOffers.map(jobOffer => {
                const category =
                  categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null;
                return (
                  <Card
                    key={jobOffer.id}
                    className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30"
                  >
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
                          className="object-contain w-full h-40 rounded bg-white p-2 mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-lg text-white">{jobOffer.title}</span>
                        <Badge
                          variant={jobOffer.homeOffice ? 'default' : 'secondary'}
                          className="ml-2 backdrop-blur-2xl bg-white/20 text-white border-white/30"
                        >
                          <Home className="h-4 w-4 mr-1" />
                          {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-1 text-white/90">
                        {category && getIconComponent?.(category.iconName)}
                        {category && <span>{category.name}</span>}
                      </div>
                      <div className="text-xs text-white/70 mb-1">
                        {formatDate(jobOffer.startDate)}
                      </div>
                      <div className="text-sm text-white/80 mb-2">
                        {jobOffer.generalDescription}
                      </div>
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center text-sm text-white/90">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span className="truncate">{jobOffer.location.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-white/90">
                          <Briefcase className="mr-2 h-4 w-4" />
                          {jobOffer.typeOfEmployment}
                        </div>
                        {jobOffer.wage && (
                          <div className="flex items-center text-sm text-white/90">
                            <Euro className="mr-2 h-4 w-4" />
                            {jobOffer.wage}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-white/90">
                          <Mail className="mr-2 h-4 w-4" />
                          {jobOffer.contactData.email}
                        </div>
                        {jobOffer.contactData.phone && (
                          <div className="flex items-center text-sm text-white/90">
                            <Phone className="mr-2 h-4 w-4" />
                            {jobOffer.contactData.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-white/90">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          <a
                            href={jobOffer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
                          >
                            Zur Bewerbung
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-white/70 mb-2">
                        Erstellt am {formatDate(jobOffer.createdAt)}
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full cursor-pointer backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                          onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full cursor-pointer backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                          onClick={() => handleDelete(jobOffer.id)}
                        >
                          Löschen
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {/* Desktop/Table Ansicht */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobOffers.map(jobOffer => (
                <JobOfferCard
                  key={jobOffer.id}
                  jobOffer={jobOffer}
                  onDelete={handleDelete}
                  category={categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
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
    <Card className="flex flex-col backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl ring-1 ring-white/30">
      {jobOffer.companyLogo ? (
        <div className="relative h-48 w-full">
          <img
            src={jobOffer.companyLogo}
            alt={jobOffer.title}
            className="object-contain w-full h-full rounded-t-lg bg-white p-4"
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
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-white">{jobOffer.title}</CardTitle>
            <CardDescription className="mt-1 text-white/80">
              {formatDate(jobOffer.startDate)}
            </CardDescription>
            {category && (
              <div className="flex items-center gap-2 mt-1 text-sm text-white/90">
                {getIconComponent?.(category.iconName)}
                <span>{category.name}</span>
              </div>
            )}
          </div>
          <Badge
            variant={jobOffer.homeOffice ? 'default' : 'secondary'}
            className="backdrop-blur-2xl bg-white/20 text-white border-white/30"
          >
            <Home className="h-4 w-4 mr-1" />
            {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-white/80 line-clamp-3 mb-4">{jobOffer.generalDescription}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-white/90">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{jobOffer.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-white/90">
            <Briefcase className="mr-2 h-4 w-4" />
            {jobOffer.typeOfEmployment}
          </div>
          {jobOffer.wage && (
            <div className="flex items-center text-sm text-white/90">
              <Euro className="mr-2 h-4 w-4" />
              {jobOffer.wage}
            </div>
          )}
          <div className="flex items-center text-sm text-white/90">
            <Mail className="mr-2 h-4 w-4" />
            {jobOffer.contactData.email}
          </div>
          {jobOffer.contactData.phone && (
            <div className="flex items-center text-sm text-white/90">
              <Phone className="mr-2 h-4 w-4" />
              {jobOffer.contactData.phone}
            </div>
          )}
          <div className="flex items-center text-sm text-white/90">
            <LinkIcon className="mr-2 h-4 w-4" />
            <a
              href={jobOffer.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
            >
              Zur Bewerbung
            </a>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-white/70">Erstellt am {formatDate(jobOffer.createdAt)}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
            onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
          >
            Bearbeiten
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
            onClick={() => onDelete(jobOffer.id)}
          >
            Löschen
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
