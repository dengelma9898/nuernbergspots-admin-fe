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
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Business, BusinessStatus } from '@/models/business';
import { useBusinessService } from '@/services/businessService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BusinessList: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const businessService = useBusinessService();

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

  const formatOpeningHours = (hours: Record<string, string>) => {
    const days = Object.keys(hours);
    if (days.length === 0) return 'Keine Öffnungszeiten angegeben';
    return `${days.length} Tage mit Öffnungszeiten`;
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
                <Globe className="mr-1 h-3 w-3" />
                +{business.imageUrls.length - 1}
              </Badge>
            )}
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{business.name}</CardTitle>
              <CardDescription className="mt-1">
                Kategorie ID: {business.categoryId}
              </CardDescription>
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
              {formatOpeningHours(business.openingHours)}
            </div>
            {business.keywordIds && business.keywordIds.length > 0 && (
              <div className="flex items-center text-sm">
                <Tag className="mr-2 h-4 w-4" />
                {business.keywordIds.length} Keywords
              </div>
            )}
            {business.nuernbergspotsReview && (
              <div className="flex items-center text-sm">
                <Star className="mr-2 h-4 w-4 text-yellow-400" />
                Nuernbergspots Review vorhanden
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Erstellt am {formatDate(business.createdAt)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
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

  const activeBusinesses = businesses.filter(b => b.status === BusinessStatus.ACTIVE);
  const pendingBusinesses = businesses.filter(b => b.status === BusinessStatus.PENDING);
  const inactiveBusinesses = businesses.filter(b => b.status === BusinessStatus.INACTIVE);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Geschäfte</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Geschäft erstellen
        </Button>
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
              Ausstehende Geschäfte ({pendingBusinesses.length})
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
              Inaktive Geschäfte ({inactiveBusinesses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {businesses.length === 0 && (
          <div className="text-center py-8">Keine Geschäfte gefunden.</div>
        )}
      </div>
    </div>
  );
}; 