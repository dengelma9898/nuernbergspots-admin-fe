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
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden hover:bg-white/10 hover:scale-105 transition-all duration-500 hover:shadow-3xl">
        {business.imageUrls && business.imageUrls.length > 0 && (
          <div className="relative h-48 w-full">
            <img
              src={business.imageUrls[0]}
              alt={business.name}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            {business.imageUrls.length > 1 && (
              <div className="absolute top-3 right-3 backdrop-blur-2xl bg-white/20 border border-white/30 text-white rounded-xl px-2 py-1 text-xs font-medium flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                +{business.imageUrls.length - 1}
              </div>
            )}
            {business.isPromoted && (
              <div className="absolute top-3 left-3 backdrop-blur-2xl bg-yellow-500/80 border border-yellow-400/50 text-white rounded-xl px-2 py-1 text-xs font-medium flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Highlight
              </div>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-3 flex-1">
              {business.logoUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} Logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{business.name}</h3>
                <p className="text-sm text-white/70">
                  Kategorien: {getCategoryNames(business.categoryIds)}
                </p>
              </div>
            </div>
            <Badge variant={status.variant} className="backdrop-blur-2xl bg-white/20 border-white/30 text-white text-xs flex items-center gap-1 px-2 py-1 rounded-xl shrink-0">
              {status.icon}
              <span>{status.label}</span>
            </Badge>
          </div>

          <p className="text-sm text-white/80 line-clamp-3 mb-4">
            {business.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-white/90">
              <MapPin className="mr-2 h-4 w-4 text-white/70" />
              <span className="truncate">
                {formatAddress(business.address)}
              </span>
            </div>
            {business.contact.phoneNumber && (
              <div className="flex items-center text-sm text-white/90">
                <Phone className="mr-2 h-4 w-4 text-white/70" />
                {business.contact.phoneNumber}
              </div>
            )}
            {business.contact.email && (
              <div className="flex items-center text-sm text-white/90">
                <Mail className="mr-2 h-4 w-4 text-white/70" />
                {business.contact.email}
              </div>
            )}
            {business.contact.website && (
              <div className="flex items-center text-sm text-white/90">
                <Globe className="mr-2 h-4 w-4 text-white/70" />
                <a href={business.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 transition-colors hover:underline">
                  Website besuchen
                </a>
              </div>
            )}
            <div className="flex items-center text-sm text-white/90">
              <Clock className="mr-2 h-4 w-4 text-white/70" />
              {formatOpeningHours(business.detailedOpeningHours)}
            </div>
            {business.keywordIds && business.keywordIds.length > 0 && (
              <div className="flex items-center text-sm text-white/90">
                <Tag className="mr-2 h-4 w-4 text-white/70" />
                {business.keywordIds.length} Keywords
              </div>
            )}
            {business.nuernbergspotsReview?.reviewText && (
              <div className="flex items-center text-sm text-white/90">
                <Star className="mr-2 h-4 w-4 text-yellow-400" />
                Nuernbergspots Review vorhanden
              </div>
            )}
            {business.isPromoted && (
              <div className="flex items-center text-sm">
                <Star className="mr-2 h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-yellow-300 font-medium">Highlight Partner</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="text-xs text-white/60">
              Erstellt am {formatDate(business.createdAt)}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditClick(business)}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl text-xs"
              >
                <Pencil className="mr-1 h-3 w-3" />
                Bearbeiten
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDelete(business.id)}
                className="backdrop-blur-2xl bg-red-500/80 border border-red-400/30 text-white hover:bg-red-400/90 hover:scale-105 transition-all duration-300 rounded-xl text-xs"
              >
                Löschen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
        
        {/* Animated Blur Circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="backdrop-blur-3xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl ring-1 ring-white/30 p-8">
            <div className="text-white text-lg font-medium">Lade Geschäfte...</div>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      
      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-full p-2 border"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </Button>
                             <h1 className="text-2xl font-bold text-xl sm:text-2xl md:text-3xl text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                 Geschäfte
               </h1>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/create-business')}
              className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-green-400/30 text-white hover:from-green-400/90 hover:to-emerald-400/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Partner hinzufügen
            </Button>
          </div>
        </div>

        {/* Glass Filter Section */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4">
            <Input
              placeholder="Nach Geschäftsnamen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="pending-filter"
                    checked={showOnlyPending}
                    onCheckedChange={setShowOnlyPending}
                    className="data-[state=checked]:bg-white/30"
                  />
                  <Label htmlFor="pending-filter" className="text-white/90 text-sm">Nur ausstehende</Label>
                </div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="review-filter"
                    checked={showOnlyWithoutReview}
                    onCheckedChange={setShowOnlyWithoutReview}
                    className="data-[state=checked]:bg-white/30"
                  />
                  <Label htmlFor="review-filter" className="text-white/90 text-sm">Ohne Review</Label>
                </div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="pending-partners-filter"
                    checked={showOnlyPendingPartners}
                    onCheckedChange={setShowOnlyPendingPartners}
                    className="data-[state=checked]:bg-white/30"
                  />
                  <Label htmlFor="pending-partners-filter" className="text-white/90 text-sm">Ausstehende Partner mit Konto</Label>
                </div>
              </div>
            </div>
            <div className="text-sm text-white/70">
              {filteredBusinesses.length} Geschäfte gefunden
            </div>
          </div>
        </div>

        {/* Business Sections */}
        <div className="space-y-8">
          {activeBusinesses.length > 0 && (
            <div className="backdrop-blur-2xl bg-white/5 rounded-3xl border border-white/10 shadow-xl ring-1 ring-white/20 p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <CheckCircle2 className="mr-3 h-6 w-6 text-green-400" />
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
            <div className="backdrop-blur-2xl bg-white/5 rounded-3xl border border-white/10 shadow-xl ring-1 ring-white/20 p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <AlertCircle className="mr-3 h-6 w-6 text-yellow-400" />
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
            <div className="backdrop-blur-2xl bg-white/5 rounded-3xl border border-white/10 shadow-xl ring-1 ring-white/20 p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <XCircle className="mr-3 h-6 w-6 text-red-400" />
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
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-8 text-center">
              <div className="text-white/80 text-lg">Keine Partner gefunden.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 