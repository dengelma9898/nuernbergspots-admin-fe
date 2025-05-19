import React, { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Tag,
  Pencil,
  Image as ImageIcon,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Business, BusinessStatus, NuernbergspotsReview } from '@/models/business';
import { useBusinessService } from '@/services/businessService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BusinessCategory } from '@/models/business-category';
import { useBusinessCategoryService } from '@/services/businessCategoryService';

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
      toast.error("Fehler beim Laden der Geschäfte", {
        description: "Die Geschäfte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
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
        toast.error('Fehler beim Laden der Kategorien', {
          description: 'Die Kategorien konnten nicht geladen werden.',
        });
      }
    };
    loadCategories();
  }, []);

  const handleDelete = async (businessId: string) => {
    try {
      await businessService.deleteBusiness(businessId);
      toast.success("Geschäft gelöscht", {
        description: "Das Geschäft wurde erfolgreich gelöscht.",
      });
      loadBusinesses();
    } catch (error) {
      toast.error("Fehler beim Löschen", {
        description: "Das Geschäft konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleEditClick = (business: Business) => {
    navigate(`/businesses/${business.id}/edit`);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  };

  const getStatusBadge = (status: BusinessStatus) => {
    switch (status) {
      case BusinessStatus.ACTIVE:
        return {
          label: 'Aktiv',
          icon: <CheckCircle2 className="h-4 w-4" />,
          variant: 'default' as const
        };
      case BusinessStatus.PENDING:
        return {
          label: 'Ausstehend',
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'outline' as const
        };
      case BusinessStatus.INACTIVE:
        return {
          label: 'Inaktiv',
          icon: <XCircle className="h-4 w-4" />,
          variant: 'secondary' as const
        };
      default:
        return {
          label: 'Unbekannt',
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'secondary' as const
        };
    }
  };

  const formatAddress = (address: Business['address']) => {
    return `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}`;
  };

  const formatOpeningHours = (hours: Record<string, Array<{ from: string; to: string }>>) => {
    if (!hours) return 'Keine Öffnungszeiten angegeben';
    const days = Object.keys(hours);
    if (days.length === 0) return 'Keine Öffnungszeiten angegeben';
    return `${days.length} Tage mit Öffnungszeiten`;
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

  const BusinessCard: React.FC<{ business: Business }> = ({ business }) => {
    const status = getStatusBadge(business.status);
    return (
      <Card key={business.id} className="flex flex-col">
        {business.imageUrls && business.imageUrls.length > 0 && (
          <div className="relative h-48 w-full">
            <img
              src={business.imageUrls[0]}
              alt={business.name}
              className="object-cover w-full h-full rounded-t-lg"
            />
            {business.imageUrls.length > 1 && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                <ImageIcon className="mr-1 h-3 w-3" />
                +{business.imageUrls.length - 1}
              </Badge>
            )}
            {business.isPromoted && (
              <Badge 
                className="absolute top-2 left-2 bg-yellow-500/90 text-white border-yellow-600"
              >
                <Star className="mr-1 h-3 w-3 fill-current" />
                Highlight
              </Badge>
            )}
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              {business.logoUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-muted">
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} Logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{business.name}</CardTitle>
                <CardDescription className="mt-1">
                  Kategorien: {getCategoryNames(business.categoryIds)}
                </CardDescription>
              </div>
            </div>
            <Badge variant={status.variant}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {business.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="truncate">
                {formatAddress(business.address)}
              </span>
            </div>
            {business.contact.phoneNumber && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4" />
                {business.contact.phoneNumber}
              </div>
            )}
            {business.contact.email && (
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4" />
                {business.contact.email}
              </div>
            )}
            {business.contact.website && (
              <div className="flex items-center text-sm">
                <Globe className="mr-2 h-4 w-4" />
                <a href={business.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Website besuchen
                </a>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4" />
              {formatOpeningHours(business.detailedOpeningHours)}
            </div>
            {business.keywordIds && business.keywordIds.length > 0 && (
              <div className="flex items-center text-sm">
                <Tag className="mr-2 h-4 w-4" />
                {business.keywordIds.length} Keywords
              </div>
            )}
            {business.nuernbergspotsReview?.reviewText && (
              <div className="flex items-center text-sm">
                <Star className="mr-2 h-4 w-4 text-yellow-400" />
                Nuernbergspots Review vorhanden
              </div>
            )}
            {business.isPromoted && (
              <div className="flex items-center text-sm">
                <Star className="mr-2 h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-yellow-500 font-medium">Highlight Partner</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Erstellt am {formatDate(business.createdAt)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEditClick(business)}>
              <Pencil className="mr-1 h-3 w-3" />
              Bearbeiten
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDelete(business.id)}
            >
              Löschen
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Geschäfte...</div>;
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPendingFilter = !showOnlyPending || business.status === BusinessStatus.PENDING;
    const matchesReviewFilter = !showOnlyWithoutReview || !business.nuernbergspotsReview?.reviewText;
    const matchesPendingPartnersFilter = !showOnlyPendingPartners || 
      (business.status === BusinessStatus.PENDING && business.hasAccount === true);
    
    return matchesSearch && matchesPendingFilter && matchesReviewFilter && matchesPendingPartnersFilter;
  });

  const activeBusinesses = filteredBusinesses.filter(b => b.status === BusinessStatus.ACTIVE);
  const pendingBusinesses = filteredBusinesses.filter(b => b.status === BusinessStatus.PENDING);
  const inactiveBusinesses = filteredBusinesses.filter(b => b.status === BusinessStatus.INACTIVE);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Geschäfte</h1>
        <div className="ml-auto">
          <Button onClick={() => navigate('/create-business')}>
            <Plus className="mr-2 h-4 w-4" />
            Partner hinzufügen
          </Button>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Nach Geschäftsnamen suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pending-filter"
                  checked={showOnlyPending}
                  onCheckedChange={setShowOnlyPending}
                />
                <Label htmlFor="pending-filter">Nur ausstehende</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="review-filter"
                  checked={showOnlyWithoutReview}
                  onCheckedChange={setShowOnlyWithoutReview}
                />
                <Label htmlFor="review-filter">Ohne Review</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="pending-partners-filter"
                  checked={showOnlyPendingPartners}
                  onCheckedChange={setShowOnlyPendingPartners}
                />
                <Label htmlFor="pending-partners-filter">Ausstehende Partner mit Konto</Label>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredBusinesses.length} Geschäfte gefunden
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {activeBusinesses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Aktive Geschäfte ({activeBusinesses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {pendingBusinesses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              Ausstehende Partner ({pendingBusinesses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {inactiveBusinesses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <XCircle className="mr-2 h-5 w-5 text-red-500" />
              Inaktive Partner ({inactiveBusinesses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-8">Keine Partner gefunden.</div>
        )}
      </div>
    </div>
  );
}; 