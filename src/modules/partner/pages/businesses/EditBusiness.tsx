import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Business, BusinessStatus, NuernbergspotsReview } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { useBusinessService } from '@/services/businessService';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { useKeywordService } from '@/services/keywordService';
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
import { Badge } from "@/components/ui/badge";

const WEEKDAYS = {
  Montag: 'Montag',
  Dienstag: 'Dienstag',
  Mittwoch: 'Mittwoch',
  Donnerstag: 'Donnerstag',
  Freitag: 'Freitag',
  Samstag: 'Samstag',
  Sonntag: 'Sonntag'
} as const;

type WeekdayKey = keyof typeof WEEKDAYS;

interface TimeSlot {
  id: string;
  from: string;
  to: string;
  days: WeekdayKey[];
}

export const EditBusiness: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const businessService = useBusinessService();
  const categoryService = useBusinessCategoryService();
  const keywordService = useKeywordService();
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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    from: '09:00',
    to: '18:00',
    days: []
  });
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadBusiness(id);
      loadCategories();
    }
  }, [id]);

  useEffect(() => {
    if (business?.categoryIds && business.categoryIds.length > 0) {
      loadKeywordsForCategories(business.categoryIds);
    } else {
      setKeywords([]);
    }
  }, [business?.categoryIds]);

  const loadBusiness = async (businessId: string) => {
    try {
      setLoading(true);
      const fetchedBusiness = await businessService.getBusiness(businessId);
      setBusiness(fetchedBusiness);
      setSelectedKeywords(fetchedBusiness.keywordIds);
      
      // Konvertiere detailedOpeningHours in TimeSlots
      if (fetchedBusiness.detailedOpeningHours) {
        const slots: TimeSlot[] = [];
        Object.entries(fetchedBusiness.detailedOpeningHours).forEach(([day, timeRanges]) => {
          timeRanges.forEach((range, index) => {
            const existingSlot = slots.find(slot => 
              slot.from === range.from && slot.to === range.to
            );
            
            if (existingSlot) {
              existingSlot.days.push(day as WeekdayKey);
            } else {
              slots.push({
                id: `${day}-${index}`,
                from: range.from,
                to: range.to,
                days: [day as WeekdayKey]
              });
            }
          });
        });
        setTimeSlots(slots);
      }
      
      setEditReview(fetchedBusiness.nuernbergspotsReview || {
        reviewText: '',
        reviewImageUrls: []
      });
      setBusinessImages(fetchedBusiness.imageUrls || []);
    } catch (error) {
      toast.error("Fehler beim Laden des Geschäfts", {
        description: "Das Geschäft konnte nicht geladen werden.",
      });
      navigate('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error("Fehler beim Laden der Kategorien", {
        description: "Die Kategorien konnten nicht geladen werden.",
      });
    }
  };

  const loadKeywordsForCategories = async (categoryIds: string[]) => {
    try {
      const selectedCategories = categories.filter(category => 
        categoryIds.includes(category.id)
      );

      const keywordIds = selectedCategories
        .flatMap(category => category.keywords || [])
        .map(keyword => keyword.id);

      const uniqueKeywordIds = [...new Set(keywordIds)];

      const keywordPromises = uniqueKeywordIds.map(id => 
        keywordService.getKeyword(id)
      );
      
      const fetchedKeywords = await Promise.all(keywordPromises);
      setKeywords(fetchedKeywords);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
      toast.error("Fehler beim Laden der Keywords", {
        description: "Die Keywords konnten nicht geladen werden.",
      });
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

  const addTimeSlot = () => {
    if (newTimeSlot.days.length === 0) {
      toast.error("Bitte wählen Sie mindestens einen Tag aus", {
        description: "Ein Zeitraum muss für mindestens einen Tag gelten.",
      });
      return;
    }

    const id = Date.now().toString();
    setTimeSlots(prev => [...prev, { ...newTimeSlot, id }]);
    setNewTimeSlot({
      from: '09:00',
      to: '18:00',
      days: []
    });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const handleTimeSlotChange = (id: string, field: keyof Omit<TimeSlot, 'id'>, value: any) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const toggleDayForTimeSlot = (day: WeekdayKey, slotId: string) => {
    setTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const days = slot.days.includes(day)
          ? slot.days.filter(d => d !== day)
          : [...slot.days, day];
        return { ...slot, days };
      }
      return slot;
    }));
  };

  const toggleDayForNewTimeSlot = (day: WeekdayKey) => {
    setNewTimeSlot(prev => {
      const days = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days };
    });
  };

  const toggleCategory = (categoryId: string) => {
    if (!business) return;

    const isSelected = business.categoryIds.includes(categoryId);
    if (isSelected) {
      const newCategoryIds = business.categoryIds.filter(id => id !== categoryId);
      const allowedKeywordIds = categories
        .filter(cat => newCategoryIds.includes(cat.id))
        .flatMap(cat => cat.keywords?.map(k => k.id) || []);
      setBusiness(prev => prev ? {
        ...prev,
        categoryIds: newCategoryIds,
        keywordIds: prev.keywordIds.filter(id => allowedKeywordIds.includes(id)),
      } : null);
    } else {
      if (business.categoryIds.length >= 3) {
        toast.error("Maximale Anzahl an Kategorien erreicht", {
          description: "Sie können maximal 3 Kategorien auswählen.",
        });
        return;
      }
      setBusiness(prev => prev ? {
        ...prev,
        categoryIds: [...prev.categoryIds, categoryId]
      } : null);
    }
  };

  const toggleKeyword = (keywordId: string) => {
    if (!business) return;

    setBusiness(prev => prev ? {
      ...prev,
      keywordIds: prev.keywordIds.includes(keywordId)
        ? prev.keywordIds.filter(id => id !== keywordId)
        : [...prev.keywordIds, keywordId]
    } : null);
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

      // 4. Öffnungszeiten aktualisieren
      const formattedDetailedOpeningHours: Record<string, Array<{ from: string; to: string }>> = {};
      
      timeSlots.forEach(slot => {
        slot.days.forEach(day => {
          if (!formattedDetailedOpeningHours[day]) {
            formattedDetailedOpeningHours[day] = [];
          }
          formattedDetailedOpeningHours[day].push({
            from: slot.from,
            to: slot.to
          });
        });
      });

      await businessService.updateBusiness(business.id, {
        detailedOpeningHours: formattedDetailedOpeningHours,
        categoryIds: business.categoryIds,
        keywordIds: business.keywordIds,
      });
      
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/businesses')} className="hover:bg-accent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Partner bearbeiten</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linke Spalte - Basisinformationen */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Basisinformationen</CardTitle>
              <CardDescription>Grundlegende Informationen zum Partner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Name</h3>
                  <p className="text-sm text-muted-foreground">{business.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Kategorie</h3>
                  <div className="flex-grow">
                    <p className="text-sm text-muted-foreground">Kategorie-IDs: {business.categoryIds.join(', ')}</p>
                  </div>
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
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Status & Highlight</CardTitle>
              <CardDescription>Partner-Status und Sichtbarkeit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <Select 
                    value={business.status} 
                    onValueChange={(value: BusinessStatus) => handleStatusChange(value)}
                  >
                    <SelectTrigger className="w-full">
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
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Kategorien</CardTitle>
              <CardDescription>Kategorien des Partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Kategorien (max. 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category.id}
                      variant={business?.categoryIds.includes(category.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.
                </p>
              </div>

              {keywords.length > 0 && (
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(keyword => (
                      <Badge
                        key={keyword.id}
                        variant={business?.keywordIds.includes(keyword.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleKeyword(keyword.id)}
                      >
                        {keyword.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wählen Sie passende Keywords aus, um das Geschäft besser auffindbar zu machen.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte - Medien & Öffnungszeiten */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Medien</CardTitle>
              <CardDescription>Logo und Geschäftsbilder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Logo</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-muted">
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
                        <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted">
                          <img
                            src={url}
                            alt={`Geschäftsbild ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveBusinessImage(url)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-video rounded-lg border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Bilder hinzufügen</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleBusinessImageUpload}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Empfohlene Größe: 1200x800 Pixel
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Öffnungszeiten</CardTitle>
              <CardDescription>Definieren Sie die Öffnungszeiten des Partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                {timeSlots.map(slot => (
                  <div key={slot.id} className="border rounded-lg p-4 space-y-4 bg-card">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Zeitraum</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeTimeSlot(slot.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Von</Label>
                        <Input
                          type="time"
                          value={slot.from}
                          onChange={(e) => handleTimeSlotChange(slot.id, 'from', e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bis</Label>
                        <Input
                          type="time"
                          value={slot.to}
                          onChange={(e) => handleTimeSlotChange(slot.id, 'to', e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gültig an</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                          <Badge
                            key={day}
                            variant={slot.days.includes(day as WeekdayKey) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                          >
                            {dayName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border rounded-lg p-4 space-y-4 bg-card">
                  <h4 className="font-medium">Neuer Zeitraum</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Von</Label>
                      <Input
                        type="time"
                        value={newTimeSlot.from}
                        onChange={(e) => 
                          setNewTimeSlot(prev => ({ ...prev, from: e.target.value }))
                        }
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bis</Label>
                      <Input
                        type="time"
                        value={newTimeSlot.to}
                        onChange={(e) => 
                          setNewTimeSlot(prev => ({ ...prev, to: e.target.value }))
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gültig an</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                        <Badge
                          key={day}
                          variant={newTimeSlot.days.includes(day as WeekdayKey) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => toggleDayForNewTimeSlot(day as WeekdayKey)}
                        >
                          {dayName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={addTimeSlot} 
                    className="w-full"
                    disabled={newTimeSlot.days.length === 0}
                  >
                    Zeitraum hinzufügen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Nuernbergspots Review</CardTitle>
              <CardDescription>Bewertung und Bilder des Partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Review Text</Label>
                  <Textarea
                    value={editReview.reviewText || ''}
                    onChange={(e) => setEditReview(prev => ({
                      ...prev,
                      reviewText: e.target.value,
                    }))}
                    placeholder="Geben Sie hier die Review ein..."
                    className="min-h-[100px] bg-background"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Review Bilder</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {editReview.reviewImageUrls?.map((url, index) => (
                      <div key={url} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted">
                          <img
                            src={url}
                            alt={`Review Bild ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveImage(url)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-video rounded-lg border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Bilder hinzufügen</p>
                      </div>
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate('/businesses')}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateBusiness} disabled={isSaving}>
              {isSaving ? 'Speichert...' : 'Änderungen speichern'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 