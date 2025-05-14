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
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Stellenangebote</h1>
        <div className="ml-auto">
          <Button onClick={() => navigate('/job-offers/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Stellenangebot hinzufügen
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Stellenangebot suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
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
          <SelectTrigger className="w-[180px]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobOffers.map((jobOffer) => (
            <JobOfferCard 
              key={jobOffer.id} 
              jobOffer={jobOffer}
              onDelete={handleDelete}
              category={categories.find(cat => cat.id === jobOffer.jobOfferCategoryId) || null}
            />
          ))}
        </div>
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