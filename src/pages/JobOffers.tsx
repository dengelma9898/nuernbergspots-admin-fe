import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Clock
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
} from "@/components/ui/select";
import { useJobCategoryService } from '@/services/jobCategoryService';
import { JobCategory } from '@/models/job-category';
import { getIconComponent } from '@/utils/iconUtils';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  } catch {
    return 'Ungültiges Datum';
  }
};

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
      toast.error("Fehler beim Laden der Daten", {
        description: "Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
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
      toast.success("Stellenangebot gelöscht", {
        description: "Das Stellenangebot wurde erfolgreich gelöscht.",
      });
      loadData();
    } catch (error) {
      toast.error("Fehler beim Löschen", {
        description: "Das Stellenangebot konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const filteredJobOffers = jobOffers.filter(jobOffer => {
    const matchesSearch = jobOffer.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || jobOffer.typeOfEmployment === typeFilter;
    const matchesHomeOffice = homeOfficeFilter === 'all' || 
      (homeOfficeFilter === 'yes' && jobOffer.homeOffice) ||
      (homeOfficeFilter === 'no' && !jobOffer.homeOffice);
    
    return matchesSearch && matchesType && matchesHomeOffice;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Stellenangebote...</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-full px-2 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold break-words w-full sm:w-auto">Stellenangebote</h1>
        <div className="w-full sm:w-auto sm:ml-auto">
          <Button onClick={() => navigate('/job-offers/create')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Stellenangebot hinzufügen
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6">
        <div className="relative flex-1 mb-2 md:mb-0">
          <Input
            placeholder="Nach Stellenangebot suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg px-1"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-lg mb-2 md:mb-0">
            <SelectValue placeholder="Beschäftigungsart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Arten</SelectItem>
            <SelectItem value="Vollzeit">Vollzeit</SelectItem>
            <SelectItem value="Teilzeit">Teilzeit</SelectItem>
            <SelectItem value="Ausbildung">Ausbildung</SelectItem>
            <SelectItem value="Praktikum">Praktikum</SelectItem>
          </SelectContent>
        </Select>
        <Select value={homeOfficeFilter} onValueChange={setHomeOfficeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
            <SelectValue placeholder="Home Office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Optionen</SelectItem>
            <SelectItem value="yes">Mit Home Office</SelectItem>
            <SelectItem value="no">Ohne Home Office</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredJobOffers.length === 0 ? (
        <div className="text-center py-8">Keine Stellenangebote gefunden.</div>
      ) : (
        <>
          {/* Mobile Card-Ansicht */}
          <div className="block md:hidden space-y-6">
            {filteredJobOffers.map((jobOffer) => {
              const category = categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null;
              return (
                <Card key={jobOffer.id} className="p-4">
                  <div className="flex flex-col gap-2">
                    {jobOffer.isHighlight && (
                      <Badge className="w-fit bg-yellow-500 text-white border-yellow-600 mb-2">⭐ Highlight</Badge>
                    )}
                    {jobOffer.companyLogo && (
                      <img
                        src={jobOffer.companyLogo}
                        alt={jobOffer.title}
                        className="object-contain w-full h-40 rounded bg-white p-2 mb-2"
                      />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-lg">{jobOffer.title}</span>
                      <Badge variant={jobOffer.homeOffice ? 'default' : 'secondary'} className="ml-2">
                        <Home className="h-4 w-4 mr-1" />
                        {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      {category && getIconComponent?.(category.iconName)}
                      {category && <span>{category.name}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{formatDate(jobOffer.startDate)}</div>
                    <div className="text-sm text-muted-foreground mb-2">{jobOffer.generalDescription}</div>
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="truncate">{jobOffer.location.address}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="mr-2 h-4 w-4" />
                        {jobOffer.typeOfEmployment}
                      </div>
                      {jobOffer.wage && (
                        <div className="flex items-center text-sm">
                          <Euro className="mr-2 h-4 w-4" />
                          {jobOffer.wage}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4" />
                        {jobOffer.contactData.email}
                      </div>
                      {jobOffer.contactData.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4" />
                          {jobOffer.contactData.phone}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <a 
                          href={jobOffer.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Zur Bewerbung
                        </a>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Erstellt am {formatDate(jobOffer.createdAt)}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full cursor-pointer"
                        onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
                      >
                        Bearbeiten
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full cursor-pointer"
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
            {filteredJobOffers.map((jobOffer) => (
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
    <Card className="flex flex-col">
      {jobOffer.companyLogo ? (
        <div className="relative h-48 w-full">
          <img
            src={jobOffer.companyLogo}
            alt={jobOffer.title}
            className="object-contain w-full h-full rounded-t-lg bg-white p-4"
          />
          {jobOffer.images && jobOffer.images.length > 0 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              <ImageIcon className="mr-1 h-3 w-3" />
              +{jobOffer.images.length}
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
            <CardTitle className="text-xl">{jobOffer.title}</CardTitle>
            <CardDescription className="mt-1">
              {formatDate(jobOffer.startDate)}
            </CardDescription>
            {category && (
              <div className="flex items-center gap-2 mt-1 text-sm">
                {getIconComponent?.(category.iconName)}
                <span>{category.name}</span>
              </div>
            )}
          </div>
          <Badge variant={jobOffer.homeOffice ? "default" : "secondary"}>
            <Home className="h-4 w-4 mr-1" />
            {jobOffer.homeOffice ? 'Home Office' : 'Vor Ort'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {jobOffer.generalDescription}
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{jobOffer.location.address}</span>
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="mr-2 h-4 w-4" />
            {jobOffer.typeOfEmployment}
          </div>
          {jobOffer.wage && (
            <div className="flex items-center text-sm">
              <Euro className="mr-2 h-4 w-4" />
              {jobOffer.wage}
            </div>
          )}
          <div className="flex items-center text-sm">
            <Mail className="mr-2 h-4 w-4" />
            {jobOffer.contactData.email}
          </div>
          {jobOffer.contactData.phone && (
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-4 w-4" />
            {jobOffer.contactData.phone}
          </div>
          )}
          <div className="flex items-center text-sm">
            <LinkIcon className="mr-2 h-4 w-4" />
            <a 
              href={jobOffer.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Zur Bewerbung
            </a>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Erstellt am {formatDate(jobOffer.createdAt)}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/job-offers/${jobOffer.id}`)}
          >
            Bearbeiten
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(jobOffer.id)}
          >
            Löschen
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 