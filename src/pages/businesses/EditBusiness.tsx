import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Business, BusinessStatus, NuernbergspotsReview } from '@/models/business';
import { BusinessCategory } from '@/models/business-category';
import { Keyword } from '@/models/keyword';
import { useBusinessService } from '@/services/businessService';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { useKeywordService } from '@/services/keywordService';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage, getUserFriendlyError } from '@/utils/errorUtils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton, glassInput } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const WEEKDAYS = {
  Montag: 'Montag',
  Dienstag: 'Dienstag',
  Mittwoch: 'Mittwoch',
  Donnerstag: 'Donnerstag',
  Freitag: 'Freitag',
  Samstag: 'Samstag',
  Sonntag: 'Sonntag',
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
    reviewImageUrls: [],
  });
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingBusinessImages, setExistingBusinessImages] = useState<string[]>([]); // Bestehende Business-Bilder
  const [businessImagesToDelete, setBusinessImagesToDelete] = useState<string[]>([]);
  const [existingReviewImages, setExistingReviewImages] = useState<string[]>([]); // Bestehende Review-Bilder
  
  // Zentrale Bildvalidierung für Business-Bilder (max 1 MB pro Bild)
  const businessImageUpload = useValidatedImageUpload({
    maxImages: 20, // Max 20 Business-Bilder
    maxSizeMB: 1,
  });
  
  // Zentrale Bildvalidierung für Review-Bilder (max 1 MB pro Bild)
  const reviewImageUpload = useValidatedImageUpload({
    maxImages: 10, // Max 10 Review-Bilder
    maxSizeMB: 1,
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    from: '09:00',
    to: '18:00',
    days: [],
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
            const existingSlot = slots.find(
              slot => slot.from === range.from && slot.to === range.to
            );

            if (existingSlot) {
              existingSlot.days.push(day as WeekdayKey);
            } else {
              slots.push({
                id: `${day}-${index}`,
                from: range.from,
                to: range.to,
                days: [day as WeekdayKey],
              });
            }
          });
        });
        setTimeSlots(slots);
      }

      const review = fetchedBusiness.nuernbergspotsReview || {
        reviewText: '',
        reviewImageUrls: [],
      };
      setEditReview(review);
      setExistingReviewImages(review.reviewImageUrls || []);
      setExistingBusinessImages(fetchedBusiness.imageUrls || []);
    } catch (error) {
      console.error('Fehler beim Laden des Geschäfts:', error);
      showUserFriendlyError(error, toast, () => loadBusiness(), 'load-business');
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
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast, () => loadCategories(), 'load-categories');
    }
  };

  const loadKeywordsForCategories = async (categoryIds: string[]) => {
    try {
      const selectedCategories = categories.filter(category => categoryIds.includes(category.id));

      const keywordIds = selectedCategories
        .flatMap(category => category.keywords || [])
        .map(keyword => keyword.id);

      const uniqueKeywordIds = [...new Set(keywordIds)];

      const keywordPromises = uniqueKeywordIds.map(id => keywordService.getKeyword(id));

      const fetchedKeywords = await Promise.all(keywordPromises);
      setKeywords(fetchedKeywords);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
      showUserFriendlyError(error, toast, () => loadKeywordsForCategories(business?.categoryIds || []), 'load-categories');
    }
  };

  const handleStatusChange = async (value: BusinessStatus) => {
    if (!business) return;

    try {
      const updateData = {
        status: value,
      };

      await businessService.updateBusiness(business.id, updateData);
      setBusiness(prev => (prev ? { ...prev, status: value } : null));
      showSuccessMessage(toast, {
        title: 'Status aktualisiert',
        description: 'Der Status wurde erfolgreich aktualisiert.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Status:', error);
      showUserFriendlyError(error, toast, () => handleStatusChange(value), 'save-business');
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
    businessImageUpload.handleFileChange(event);
  };

  const handleRemoveBusinessImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Bestehendes Bild zum Löschen markieren
      const imageUrl = existingBusinessImages[index];
      setBusinessImagesToDelete(prev => [...prev, imageUrl]);
      setExistingBusinessImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Neues Bild entfernen
      businessImageUpload.removeImage(index);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    reviewImageUpload.handleFileChange(event);
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Bestehendes Bild zum Löschen markieren
      const imageUrl = existingReviewImages[index];
      setImagesToDelete(prev => [...prev, imageUrl]);
      setExistingReviewImages(prev => prev.filter((_, i) => i !== index));
      setEditReview(prev => ({
        ...prev,
        reviewImageUrls: prev.reviewImageUrls?.filter((_, i) => i !== index) || [],
      }));
    } else {
      // Neues Bild entfernen
      reviewImageUpload.removeImage(index);
    }
  };

  const addTimeSlot = () => {
    if (newTimeSlot.days.length === 0) {
      setValidationErrors(['Bitte wählen Sie mindestens einen Tag aus. Ein Zeitraum muss für mindestens einen Tag gelten.']);
      return;
    }
    
    setValidationErrors([]);

    const id = Date.now().toString();
    setTimeSlots(prev => [...prev, { ...newTimeSlot, id }]);
    setNewTimeSlot({
      from: '09:00',
      to: '18:00',
      days: [],
    });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const handleTimeSlotChange = (id: string, field: keyof Omit<TimeSlot, 'id'>, value: any) => {
    setTimeSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, [field]: value } : slot)));
  };

  const toggleDayForTimeSlot = (day: WeekdayKey, slotId: string) => {
    setTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          const days = slot.days.includes(day)
            ? slot.days.filter(d => d !== day)
            : [...slot.days, day];
          return { ...slot, days };
        }
        return slot;
      })
    );
  };

  const toggleDayForNewTimeSlot = (day: WeekdayKey) => {
    setNewTimeSlot(prev => {
      const days = prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day];
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
      setBusiness(prev =>
        prev
          ? {
              ...prev,
              categoryIds: newCategoryIds,
              keywordIds: prev.keywordIds.filter(id => allowedKeywordIds.includes(id)),
            }
          : null
      );
      } else {
        if (business.categoryIds.length >= 3) {
          setValidationErrors(['Sie können maximal 3 Kategorien auswählen.']);
          return;
        }
        // Fehler zurücksetzen, wenn Kategorie hinzugefügt wird
        if (validationErrors.length > 0) {
          setValidationErrors([]);
        }
      setBusiness(prev =>
        prev
          ? {
              ...prev,
              categoryIds: [...prev.categoryIds, categoryId],
            }
          : null
      );
    }
  };

  const toggleKeyword = (keywordId: string) => {
    if (!business) return;

    setBusiness(prev =>
      prev
        ? {
            ...prev,
            keywordIds: prev.keywordIds.includes(keywordId)
              ? prev.keywordIds.filter(id => id !== keywordId)
              : [...prev.keywordIds, keywordId],
          }
        : null
    );
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
      // Business-Bilder hochladen, falls neue vorhanden
      if (businessImageUpload.files.length > 0) {
        await businessService.uploadBusinessImages(business.id, businessImageUpload.files);
      }

      // 3. Review aktualisieren
      const updatedReview: NuernbergspotsReview = {
        reviewText: editReview.reviewText,
        reviewImageUrls:
          existingReviewImages
            .filter(url => !imagesToDelete.includes(url)) || [],
      };

      await businessService.updateNuernbergspotsReview(business.id, updatedReview);

      // Review-Bilder hochladen, falls neue vorhanden
      if (reviewImageUpload.files.length > 0) {
        await businessService.uploadReviewImages(business.id, reviewImageUpload.files);
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
            to: slot.to,
          });
        });
      });

      await businessService.updateBusiness(business.id, {
        detailedOpeningHours: formattedDetailedOpeningHours,
        categoryIds: business.categoryIds,
        keywordIds: business.keywordIds,
      });

      showSuccessMessage(toast, {
        title: 'Änderungen gespeichert',
        description: business ? `"${business.name}" wurde erfolgreich aktualisiert.` : 'Alle Änderungen wurden erfolgreich gespeichert.',
      });

      navigate('/businesses');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Geschäfts:', error);
      const friendlyError = getUserFriendlyError(error, 'save-business');
      
      // Wenn Validierungsfehler vorhanden sind, zeige sie auf der Seite
      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        // Für andere Fehler zeige Toast
        showUserFriendlyError(error, toast, () => handleSave(), 'save-business');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <div className="relative z-10 container mx-auto py-6">
            {/* Header Skeleton */}
            <div className={cn(glassCard, 'p-6 mb-8')}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-40 rounded-xl" />
                  <Skeleton className="h-8 w-48 rounded" />
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Linke Spalte Skeletons */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basisinformationen Card Skeleton */}
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <Skeleton className="h-6 w-40 rounded mb-2" />
                  <Skeleton className="h-4 w-64 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-5 w-20 rounded" />
                      <Skeleton className="h-4 w-full rounded" />
                      {index === 3 && (
                        <Skeleton className="h-4 w-3/4 rounded" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Status & Highlight Card Skeleton */}
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <Skeleton className="h-6 w-40 rounded mb-2" />
                  <Skeleton className="h-4 w-48 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-9 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-48 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kategorien Card Skeleton */}
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 rounded mb-2" />
                  <Skeleton className="h-4 w-40 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton
                          key={index}
                          className="h-6 w-20 rounded-full"
                        />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 8 }, (_, index) => (
                        <Skeleton
                          key={index}
                          className="h-6 w-16 rounded-full"
                        />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rechte Spalte Skeletons */}
            <div className="lg:col-span-2 space-y-6">
              {/* Medien Card Skeleton */}
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <Skeleton className="h-6 w-20 rounded mb-2" />
                  <Skeleton className="h-4 w-48 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Logo Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-12 rounded mb-2" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-32 h-32 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-32 rounded" />
                          <Skeleton className="h-3 w-40 rounded" />
                        </div>
                      </div>
                    </div>
                    {/* Geschäftsbilder Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-32 rounded mb-2" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Skeleton
                            key={index}
                            className="aspect-video rounded-lg"
                          />
                        ))}
                      </div>
                      <Skeleton className="h-3 w-48 rounded mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Öffnungszeiten Card Skeleton */}
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 rounded mb-2" />
                  <Skeleton className="h-4 w-64 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zeitslots Skeletons */}
                  {Array.from({ length: 2 }, (_, index) => (
                    <div
                      key={index}
                      className={cn(glassCard, 'p-4 space-y-4')}
                    >
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16 rounded" />
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 7 }, (_, dayIndex) => (
                            <Skeleton
                              key={dayIndex}
                              className="h-6 w-16 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Neuer Zeitraum Skeleton */}
                  <div className={cn(glassCard, 'p-4 space-y-4')}>
                    <Skeleton className="h-5 w-32 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full rounded" />
                      <Skeleton className="h-10 w-full rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                          <Skeleton
                            key={dayIndex}
                            className="h-6 w-16 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </CardContent>
              </Card>

              {/* Nuernbergspots Review Card Skeleton */}
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 rounded mb-2" />
                  <Skeleton className="h-4 w-56 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-24 w-full rounded" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-28 rounded mb-2" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 4 }, (_, index) => (
                          <Skeleton
                            key={index}
                            className="aspect-video rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-10 w-40 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      </PageTransition>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          {/* Header */}
        <motion.div
          className={cn(glassCard, 'p-6 mb-8')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/businesses')}
                className={cn(glassButton)}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Zurück zur Übersicht
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Partner bearbeiten
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Linke Spalte - Basisinformationen */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basisinformationen Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Basisinformationen</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Grundlegende Informationen zum Partner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 text-foreground">Name</h3>
                      <p className="text-sm text-muted-foreground">{business.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 text-foreground">Kategorie</h3>
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                          Kategorie-IDs: {business.categoryIds.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 text-foreground">Adresse</h3>
                      <p className="text-sm text-muted-foreground">
                        {business.address.street} {business.address.houseNumber},{' '}
                        {business.address.postalCode} {business.address.city}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 text-foreground">Kontakt</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {business.contact.email && <p>{business.contact.email}</p>}
                        {business.contact.phoneNumber && <p>{business.contact.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status & Highlight Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Status & Highlight</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Partner-Status und Sichtbarkeit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 text-foreground">Status</h3>
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
                        onCheckedChange={async checked => {
                          try {
                            await businessService.updateBusiness(business.id, {
                              isPromoted: checked,
                            });
                            setBusiness(prev => (prev ? { ...prev, isPromoted: checked } : null));
                            showSuccessMessage(toast, {
                              title: 'Highlight-Status aktualisiert',
                              description: checked
                                ? 'Der Partner wurde als Highlight markiert.'
                                : 'Der Highlight-Status wurde entfernt.',
                            });
                          } catch (error) {
                            console.error('Fehler beim Aktualisieren des Highlight-Status:', error);
                            showUserFriendlyError(error, toast, undefined, 'save-business');
                          }
                        }}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="isPromoted" className="text-foreground">
                          Als "Highlight" markieren
                        </Label>
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
            </motion.div>

            {/* Kategorien Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Kategorien</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Kategorien des Partners
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Kategorien (max. 3)</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Badge
                          key={category.id}
                          variant={
                            business?.categoryIds.includes(category.id) ? 'default' : 'outline'
                          }
                          className="cursor-pointer transition-all duration-300 hover:scale-105"
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
                      <Label className="text-foreground">Keywords</Label>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map(keyword => (
                          <Badge
                            key={keyword.id}
                            variant={
                              business?.keywordIds.includes(keyword.id) ? 'default' : 'outline'
                            }
                            className="cursor-pointer transition-all duration-300 hover:scale-105"
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
            </motion.div>
          </div>

          {/* Rechte Spalte - Medien & Öffnungszeiten */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medien Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Medien</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Logo und Geschäftsbilder
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 text-foreground">Logo</h3>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-secondary">
                          <img
                            src={logoPreview || business.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <label className={cn(glassButton, 'inline-flex items-center px-4 py-2 cursor-pointer')}>
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
                      <h3 className="font-medium mb-2 text-foreground">Geschäftsbilder</h3>
                      {businessImageUpload.error && (
                        <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50 mb-4')}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{businessImageUpload.error.title}</AlertTitle>
                          <AlertDescription className="mt-2">
                            <p>{businessImageUpload.error.message}</p>
                            {businessImageUpload.error.actionHint && (
                              <p className="mt-2 text-sm opacity-90">{businessImageUpload.error.actionHint}</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Bestehende Business-Bilder */}
                        {existingBusinessImages.map((url, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                              <img
                                src={url}
                                alt={`Geschäftsbild ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveBusinessImage(index, true)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                              aria-label="Bild entfernen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {/* Neue Business-Bilder */}
                        {businessImageUpload.previewUrls.map((url, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                              <img
                                src={url}
                                alt={`Geschäftsbild ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveBusinessImage(index, false)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                              aria-label="Bild entfernen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-video rounded-lg border-2 border-dashed border-secondary bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-all duration-300">
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
                      <p className="text-sm text-muted-foreground mt-2">Empfohlene Größe: 1200x800 Pixel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Öffnungszeiten Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.4 }}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Öffnungszeiten</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Definieren Sie die Öffnungszeiten des Partners
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Validierungsfehler */}
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
                      <AlertDescription className="mt-2">
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4">
                    {timeSlots.map(slot => (
                      <div
                        key={slot.id}
                        className={cn(glassCard, 'p-4 space-y-4')}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-foreground">Zeitraum</h4>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(slot.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">Von</Label>
                            <Input
                              type="time"
                              value={slot.from}
                              onChange={e => handleTimeSlotChange(slot.id, 'from', e.target.value)}
                              className={cn(glassInput)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Bis</Label>
                            <Input
                              type="time"
                              value={slot.to}
                              onChange={e => handleTimeSlotChange(slot.id, 'to', e.target.value)}
                              className={cn(glassInput)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Gültig an</Label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                              <Badge
                                key={day}
                                variant={
                                  slot.days.includes(day as WeekdayKey) ? 'default' : 'outline'
                                }
                                className="cursor-pointer transition-all duration-300 hover:scale-105"
                                onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                              >
                                {dayName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className={cn(glassCard, 'p-4 space-y-4')}>
                      <h4 className="font-medium text-foreground">Neuer Zeitraum</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Von</Label>
                          <Input
                            type="time"
                            value={newTimeSlot.from}
                            onChange={e =>
                              setNewTimeSlot(prev => ({ ...prev, from: e.target.value }))
                            }
                            className={cn(glassInput)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Bis</Label>
                          <Input
                            type="time"
                            value={newTimeSlot.to}
                            onChange={e => setNewTimeSlot(prev => ({ ...prev, to: e.target.value }))}
                            className={cn(glassInput)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Gültig an</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                            <Badge
                              key={day}
                              variant={
                                newTimeSlot.days.includes(day as WeekdayKey) ? 'default' : 'outline'
                              }
                              className="cursor-pointer transition-all duration-300 hover:scale-105"
                              onClick={() => toggleDayForNewTimeSlot(day as WeekdayKey)}
                            >
                              {dayName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <AnimatedButton
                        onClick={addTimeSlot}
                        className="w-full"
                        disabled={newTimeSlot.days.length === 0}
                      >
                        Zeitraum hinzufügen
                      </AnimatedButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Nuernbergspots Review Card */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.5 }}
            >
              <Card className={cn(glassCard)}>
                <CardHeader>
                  <CardTitle className="text-foreground">Nuernbergspots Review</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Bewertung und Bilder des Partners
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Review Text</Label>
                      <Textarea
                        value={editReview.reviewText || ''}
                        onChange={e =>
                          setEditReview(prev => ({
                            ...prev,
                            reviewText: e.target.value,
                          }))
                        }
                        placeholder="Geben Sie hier die Review ein..."
                        className={cn(glassInput, 'min-h-[100px]')}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 text-foreground">Review Bilder</h4>
                      {reviewImageUpload.error && (
                        <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50 mb-4')}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{reviewImageUpload.error.title}</AlertTitle>
                          <AlertDescription className="mt-2">
                            <p>{reviewImageUpload.error.message}</p>
                            {reviewImageUpload.error.actionHint && (
                              <p className="mt-2 text-sm opacity-90">{reviewImageUpload.error.actionHint}</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Bestehende Review-Bilder */}
                        {existingReviewImages.map((url, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                              <img
                                src={url}
                                alt={`Review Bild ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveImage(index, true)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                              aria-label="Bild entfernen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {/* Neue Review-Bilder */}
                        {reviewImageUpload.previewUrls.map((url, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-secondary bg-muted">
                              <img
                                src={url}
                                alt={`Review Bild ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveImage(index, false)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/80 hover:scale-110"
                              aria-label="Bild entfernen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-video rounded-lg border-2 border-dashed border-secondary bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-all duration-300">
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
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary">
              <AnimatedButton
                variant="outline"
                onClick={() => navigate('/businesses')}
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                Abbrechen
              </AnimatedButton>
              <LoadingButton
                onClick={handleUpdateBusiness}
                isLoading={isSaving}
                loadingText="Speichert..."
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                Änderungen speichern
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};
