import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Business, BusinessStatus, NuernbergspotsReview } from '@/models/business';
import { useBusinessService } from '@/services/businessService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const EditBusiness: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const businessService = useBusinessService();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editReview, setEditReview] = useState<NuernbergspotsReview>({
    reviewText: '',
    reviewImageUrls: []
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [newBusinessImages, setNewBusinessImages] = useState<File[]>([]);
  const [businessImagesToDelete, setBusinessImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadBusiness(id);
    }
  }, [id]);

  const loadBusiness = async (businessId: string) => {
    try {
      setLoading(true);
      const fetchedBusiness = await businessService.getBusiness(businessId);
      setBusiness(fetchedBusiness);
      setEditReview(fetchedBusiness.nuernbergspotsReview || {
        reviewText: '',
        reviewImageUrls: []
      });
      setBusinessImages(fetchedBusiness.imageUrls || []);
    } catch (error) {
      toast.error("Fehler beim Laden des Partners", {
        description: "Der Partner konnte nicht geladen werden.",
      });
      navigate('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (value: BusinessStatus) => {
    if (!business) return;

    try {
      const updateData = {
        status: value,
      };
      
      await businessService.updateBusiness(business.id, updateData);
      setBusiness(prev => prev ? { ...prev, status: value } : null);
      toast.success("Status aktualisiert", {
        description: "Der Status wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast.error("Fehler beim Aktualisieren des Status", {
        description: "Der Status konnte nicht aktualisiert werden.",
      });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNewLogo(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleBusinessImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setNewBusinessImages(prev => [...prev, ...fileArray]);
    
    const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
    setBusinessImages(prev => [...prev, ...newImageUrls]);
  };

  const handleRemoveBusinessImage = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      setBusinessImagesToDelete(prev => [...prev, imageUrl]);
    }
    
    if (imageUrl.startsWith('blob:')) {
      const index = businessImages.indexOf(imageUrl);
      if (index >= 0) {
        URL.revokeObjectURL(imageUrl);
        setNewBusinessImages(prev => prev.filter((_, i) => i !== index));
      }
    }

    setBusinessImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setNewImages(prev => [...prev, ...fileArray]);
    
    const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
    setEditReview(prev => ({
      ...prev,
      reviewImageUrls: [...(prev.reviewImageUrls || []), ...newImageUrls],
    }));
  };

  const handleRemoveImage = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      setImagesToDelete(prev => [...prev, imageUrl]);
    }
    
    if (imageUrl.startsWith('blob:')) {
      const index = editReview.reviewImageUrls?.indexOf(imageUrl) || -1;
      if (index >= 0) {
        URL.revokeObjectURL(imageUrl);
        setNewImages(prev => prev.filter((_, i) => i !== index));
      }
    }

    setEditReview(prev => ({
      ...prev,
      reviewImageUrls: prev.reviewImageUrls?.filter(url => url !== imageUrl) || [],
    }));
  };

  const handleUpdateBusiness = async () => {
    if (!business) return;

    try {
      setIsSaving(true);

      // 1. Logo aktualisieren
      if (newLogo) {
        await businessService.uploadLogo(business.id, newLogo);
      }

      // 2. Geschäftsbilder aktualisieren
      const updatedBusinessImages = businessImages
        .filter(url => !businessImagesToDelete.includes(url))
        .filter(url => url.startsWith('http'));

      if (newBusinessImages.length > 0) {
        await businessService.uploadBusinessImages(business.id, newBusinessImages);
      }

      // 3. Review aktualisieren
      const updatedReview: NuernbergspotsReview = {
        reviewText: editReview.reviewText,
        reviewImageUrls: editReview.reviewImageUrls?.filter(url => !imagesToDelete.includes(url)).filter(url => url.startsWith('http')) || []
      };

      await businessService.updateNuernbergspotsReview(business.id, updatedReview);

      if (newImages.length > 0) {
        await businessService.uploadReviewImages(business.id, newImages);
      }
      
      toast.success("Änderungen gespeichert", {
        description: "Alle Änderungen wurden erfolgreich gespeichert.",
      });
      
      navigate('/businesses');
    } catch (error) {
      toast.error("Fehler beim Aktualisieren", {
        description: "Die Änderungen konnten nicht gespeichert werden.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Partner...</div>;
  }

  if (!business) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/businesses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-2xl font-bold">Partner bearbeiten</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{business.name}</CardTitle>
          <CardDescription>
            Bearbeiten Sie die Details des Partners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Name</h3>
              <p className="text-sm text-muted-foreground">{business.name}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Kategorie</h3>
              <p className="text-sm text-muted-foreground">ID: {business.categoryId}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Adresse</h3>
              <p className="text-sm text-muted-foreground">
                {business.address.street} {business.address.houseNumber}, {business.address.postalCode} {business.address.city}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Kontakt</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {business.contact.email && <p>{business.contact.email}</p>}
                {business.contact.phoneNumber && <p>{business.contact.phoneNumber}</p>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Logo</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <img
                  src={logoPreview || business.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <label className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="mr-2 h-4 w-4" />
                  Logo hochladen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  Empfohlene Größe: 512x512 Pixel
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Geschäftsbilder</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {businessImages.map((url, index) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt={`Geschäftsbild ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveBusinessImage(url)}
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
                  onChange={handleBusinessImageUpload}
                />
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Empfohlene Größe: 1200x800 Pixel
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Status</h3>
            <Select 
              value={business.status} 
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

          <div className="flex items-center space-x-2">
            <Switch
              id="isPromoted"
              checked={business.isPromoted}
              onCheckedChange={async (checked) => {
                try {
                  await businessService.updateBusiness(business.id, {
                    isPromoted: checked
                  });
                  setBusiness(prev => prev ? { ...prev, isPromoted: checked } : null);
                  toast.success("Highlight-Status aktualisiert", {
                    description: checked 
                      ? "Der Partner wurde als Highlight markiert." 
                      : "Der Highlight-Status wurde entfernt.",
                  });
                } catch (error) {
                  toast.error("Fehler beim Aktualisieren", {
                    description: "Der Highlight-Status konnte nicht aktualisiert werden.",
                  });
                }
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="isPromoted">Als "Highlight" markieren</Label>
              <p className="text-sm text-muted-foreground">
                {business.isPromoted 
                  ? 'Dieser Partner wird als Highlight angezeigt ✨' 
                  : 'Markiere diesen Partner als Highlight'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Nuernbergspots Review</h3>
            <div className="space-y-4">
              <Textarea
                value={editReview.reviewText || ''}
                onChange={(e) => setEditReview(prev => ({
                  ...prev,
                  reviewText: e.target.value,
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

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate('/businesses')}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateBusiness} disabled={isSaving}>
              {isSaving ? 'Speichert...' : 'Änderungen speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 