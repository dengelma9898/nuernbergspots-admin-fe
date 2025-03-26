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
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Business, BusinessStatus, NuernbergspotsReview } from '@/models/business';
import { useBusinessService } from '@/services/businessService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BusinessList: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<BusinessStatus | null>(null);
  const [editReview, setEditReview] = useState<NuernbergspotsReview>({
    reviewText: '',
    reviewImageUrls: [],
    updatedAt: new Date().toISOString()
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleEditClick = (business: Business) => {
    setEditingBusiness(business);
    setEditStatus(business.status);
    setEditReview(business.nuernbergspotsReview || {
      reviewText: '',
      reviewImageUrls: [],
      updatedAt: new Date().toISOString()
    });
    setNewImages([]);
    setImagesToDelete([]);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = async (value: BusinessStatus) => {
    if (!editingBusiness) return;

    try {
      const updateData = {
        status: value,
      };
      
      console.log('Sending update data:', updateData);
      await businessService.updateBusiness(editingBusiness.id, updateData);
      setEditStatus(value);
      toast.success("Status aktualisiert", {
        description: "Der Status wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Fehler beim Aktualisieren des Status", {
        description: "Der Status konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleUpdateBusiness = async () => {
    if (!editingBusiness) return;

    try {
      setIsSaving(true);

      // 1. Review-Text und gefilterte Bilder aktualisieren
      const updatedReview: NuernbergspotsReview = {
        reviewText: editReview.reviewText,
        reviewImageUrls: editReview.reviewImageUrls?.filter(url => !imagesToDelete.includes(url)) || [],
      };

      await businessService.updateNuernbergspotsReview(editingBusiness.id, updatedReview);

      // 2. Wenn es neue Bilder gibt, diese hochladen
      if (newImages.length > 0) {
        await businessService.uploadReviewImages(editingBusiness.id, newImages);
      }
      
      toast.success("Review aktualisiert", {
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
      
      setIsEditDialogOpen(false);
      setEditingBusiness(null);
      setNewImages([]);
      setImagesToDelete([]);
      loadBusinesses();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren", {
        description: "Die Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setNewImages(prev => [...prev, ...fileArray]);
    
    // Lokale Vorschau der Bilder
    const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
    setEditReview(prev => ({
      ...prev,
      reviewImageUrls: [...(prev.reviewImageUrls || []), ...newImageUrls],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleRemoveImage = (imageUrl: string) => {
    // Wenn es eine URL vom Server ist, zur Löschliste hinzufügen
    if (imageUrl.startsWith('http')) {
      setImagesToDelete(prev => [...prev, imageUrl]);
    }
    
    // Wenn es ein lokales Bild ist, aus newImages entfernen
    if (imageUrl.startsWith('blob:')) {
      const index = editReview.reviewImageUrls?.indexOf(imageUrl) || -1;
      if (index >= 0) {
        URL.revokeObjectURL(imageUrl); // Speicher freigeben
        setNewImages(prev => prev.filter((_, i) => i !== index));
      }
    }

    // Aus der Vorschau entfernen
    setEditReview(prev => ({
      ...prev,
      reviewImageUrls: prev.reviewImageUrls?.filter(url => url !== imageUrl) || [],
      updatedAt: new Date().toISOString()
    }));
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
            {business.nuernbergspotsReview?.reviewText && (
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

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // Beim Schließen des Dialogs alle lokalen Bild-URLs aufräumen
            editReview.reviewImageUrls?.forEach(url => {
              if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            });
          }
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Geschäft bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie den Status und die Review des Geschäfts
            </DialogDescription>
          </DialogHeader>

          {editingBusiness && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Name</h3>
                  <p className="text-sm text-muted-foreground">{editingBusiness.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Kategorie</h3>
                  <p className="text-sm text-muted-foreground">ID: {editingBusiness.categoryId}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Adresse</h3>
                  <p className="text-sm text-muted-foreground">{formatAddress(editingBusiness.address)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Kontakt</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {editingBusiness.contact.email && (
                      <p>{editingBusiness.contact.email}</p>
                    )}
                    {editingBusiness.contact.phoneNumber && (
                      <p>{editingBusiness.contact.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <Select 
                  value={editStatus || ''} 
                  onValueChange={(value: BusinessStatus) => handleStatusChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusinessStatus.ACTIVE}>Aktiv</SelectItem>
                    <SelectItem value={BusinessStatus.PENDING}>Ausstehend</SelectItem>
                    <SelectItem value={BusinessStatus.INACTIVE}>Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-medium mb-2">Nuernbergspots Review</h3>
                <div className="space-y-4">
                  <Textarea
                    value={editReview.reviewText || ''}
                    onChange={(e) => setEditReview(prev => ({
                      ...prev,
                      reviewText: e.target.value,
                      updatedAt: new Date().toISOString()
                    }))}
                    placeholder="Geben Sie hier die Review ein..."
                    className="min-h-[100px]"
                  />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Review Bilder</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {editReview.reviewImageUrls?.map((url, index) => (
                        <div key={url} className="relative group">
                          <img
                            src={url}
                            alt={`Review Bild ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(url)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Bilder hinzufügen
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleUpdateBusiness}
              disabled={isSaving}
              className={`min-w-[120px] relative transition-all duration-200 ${isSaving ? 'pl-3' : ''}`}
            >
              <span className={`flex items-center justify-center transition-opacity duration-200 ${isSaving ? 'opacity-0' : 'opacity-100'}`}>
                Review speichern
              </span>
              {isSaving && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200">
                  <svg 
                    className="animate-spin h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Speichert...</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 