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
import { Skeleton } from '@/components/ui/skeleton';
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
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
        
        {/* Animated Blur Circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '500ms'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '700ms'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '300ms'}}></div>

        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
          {/* Glass Header Skeleton */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-40 bg-white/10 backdrop-blur-xl rounded-xl" />
                <Skeleton className="h-8 w-48 bg-white/10 backdrop-blur-xl rounded" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Linke Spalte Skeletons */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basisinformationen Card Skeleton */}
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                  <Skeleton className="h-6 w-40 bg-white/10 backdrop-blur-xl rounded mb-2" />
                  <Skeleton className="h-4 w-64 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-5 w-20 bg-white/10 backdrop-blur-xl rounded" />
                      <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
                      {index === 3 && <Skeleton className="h-4 w-3/4 bg-white/10 backdrop-blur-xl rounded" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Highlight Card Skeleton */}
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                  <Skeleton className="h-6 w-40 bg-white/10 backdrop-blur-xl rounded mb-2" />
                  <Skeleton className="h-4 w-48 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-16 bg-white/10 backdrop-blur-xl rounded" />
                      <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-9 bg-white/10 backdrop-blur-xl rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                        <Skeleton className="h-3 w-48 bg-white/10 backdrop-blur-xl rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kategorien Card Skeleton */}
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                  <Skeleton className="h-6 w-32 bg-white/10 backdrop-blur-xl rounded mb-2" />
                  <Skeleton className="h-4 w-40 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton key={index} className="h-6 w-20 bg-white/10 backdrop-blur-xl rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-full bg-white/10 backdrop-blur-xl rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-white/10 backdrop-blur-xl rounded" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 8 }, (_, index) => (
                        <Skeleton key={index} className="h-6 w-16 bg-white/10 backdrop-blur-xl rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-full bg-white/10 backdrop-blur-xl rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Rechte Spalte Skeletons */}
            <div className="lg:col-span-2 space-y-6">
              {/* Medien Card Skeleton */}
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                  <Skeleton className="h-6 w-20 bg-white/10 backdrop-blur-xl rounded mb-2" />
                  <Skeleton className="h-4 w-48 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-4">
                    {/* Logo Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-12 bg-white/10 backdrop-blur-xl rounded mb-2" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-32 bg-white/10 backdrop-blur-xl rounded" />
                          <Skeleton className="h-3 w-40 bg-white/10 backdrop-blur-xl rounded" />
                        </div>
                      </div>
                    </div>
                    {/* Geschäftsbilder Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-32 bg-white/10 backdrop-blur-xl rounded mb-2" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Skeleton key={index} className="aspect-video bg-white/10 backdrop-blur-xl rounded-lg" />
                        ))}
                      </div>
                      <Skeleton className="h-3 w-48 bg-white/10 backdrop-blur-xl rounded mt-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Öffnungszeiten Card Skeleton */}
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                  <Skeleton className="h-6 w-32 bg-white/10 backdrop-blur-xl rounded mb-2" />
                  <Skeleton className="h-4 w-64 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Zeitslots Skeletons */}
                  {Array.from({ length: 2 }, (_, index) => (
                    <div key={index} className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-20 bg-white/10 backdrop-blur-xl rounded" />
                        <Skeleton className="h-8 w-8 bg-white/10 backdrop-blur-xl rounded" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
                        <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16 bg-white/10 backdrop-blur-xl rounded" />
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 7 }, (_, dayIndex) => (
                            <Skeleton key={dayIndex} className="h-6 w-16 bg-white/10 backdrop-blur-xl rounded-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Neuer Zeitraum Skeleton */}
                  <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
                    <Skeleton className="h-5 w-32 bg-white/10 backdrop-blur-xl rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
                      <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16 bg-white/10 backdrop-blur-xl rounded" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                          <Skeleton key={dayIndex} className="h-6 w-16 bg-white/10 backdrop-blur-xl rounded-full" />
                        ))}
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded" />
                  </div>
                </div>
              </div>

              {/* Nuernbergspots Review Card Skeleton */}
              <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                  <Skeleton className="h-6 w-48 bg-white/10 backdrop-blur-xl rounded mb-2" />
                  <Skeleton className="h-4 w-56 bg-white/10 backdrop-blur-xl rounded" />
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
                      <Skeleton className="h-24 w-full bg-white/10 backdrop-blur-xl rounded" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-28 bg-white/10 backdrop-blur-xl rounded mb-2" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 4 }, (_, index) => (
                          <Skeleton key={index} className="aspect-video bg-white/10 backdrop-blur-xl rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Skeleton className="h-10 w-24 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-10 w-40 bg-white/10 backdrop-blur-xl rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      
      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '500ms'}}></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '700ms'}}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '300ms'}}></div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/businesses')} 
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl px-3 py-2 border"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Zurück zur Übersicht
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Partner bearbeiten
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Linke Spalte - Basisinformationen */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basisinformationen Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Basisinformationen
                </h2>
                <p className="text-white/70 text-sm mt-2">Grundlegende Informationen zum Partner</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 text-white">Name</h3>
                    <p className="text-sm text-white/70">{business.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-white">Kategorie</h3>
                    <div className="flex-grow">
                      <p className="text-sm text-white/70">Kategorie-IDs: {business.categoryIds.join(', ')}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-white">Adresse</h3>
                    <p className="text-sm text-white/70">
                      {business.address.street} {business.address.houseNumber}, {business.address.postalCode} {business.address.city}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-white">Kontakt</h3>
                    <div className="text-sm text-white/70 space-y-1">
                      {business.contact.email && <p>{business.contact.email}</p>}
                      {business.contact.phoneNumber && <p>{business.contact.phoneNumber}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Highlight Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Status & Highlight
                </h2>
                <p className="text-white/70 text-sm mt-2">Partner-Status und Sichtbarkeit</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 text-white">Status</h3>
                    <Select 
                      value={business.status} 
                      onValueChange={(value: BusinessStatus) => handleStatusChange(value)}
                    >
                      <SelectTrigger className="w-full backdrop-blur-2xl bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Status auswählen" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-3xl bg-black/80 border-white/20">
                        <SelectItem value={BusinessStatus.ACTIVE} className="text-white hover:bg-white/20">Aktiv</SelectItem>
                        <SelectItem value={BusinessStatus.PENDING} className="text-white hover:bg-white/20">Ausstehend</SelectItem>
                        <SelectItem value={BusinessStatus.INACTIVE} className="text-white hover:bg-white/20">Inaktiv</SelectItem>
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
                      <Label htmlFor="isPromoted" className="text-white">Als "Highlight" markieren</Label>
                      <p className="text-sm text-white/70">
                        {business.isPromoted 
                          ? 'Dieser Partner wird als Highlight angezeigt ✨' 
                          : 'Markiere diesen Partner als Highlight'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kategorien Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Kategorien
                </h2>
                <p className="text-white/70 text-sm mt-2">Kategorien des Partners</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Kategorien (max. 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category.id}
                        variant={business?.categoryIds.includes(category.id) ? "default" : "outline"}
                        className="cursor-pointer backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-white/70">
                    Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.
                  </p>
                </div>

                {keywords.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white">Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map(keyword => (
                        <Badge
                          key={keyword.id}
                          variant={business?.keywordIds.includes(keyword.id) ? "default" : "outline"}
                          className="cursor-pointer backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                          onClick={() => toggleKeyword(keyword.id)}
                        >
                          {keyword.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-white/70">
                      Wählen Sie passende Keywords aus, um das Geschäft besser auffindbar zu machen.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rechte Spalte - Medien & Öffnungszeiten */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medien Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Medien
                </h2>
                <p className="text-white/70 text-sm mt-2">Logo und Geschäftsbilder</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 text-white">Logo</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-white/20">
                        <img
                          src={logoPreview || business.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <label className="inline-flex items-center px-4 py-2 backdrop-blur-2xl bg-white/10 border border-white/20 text-white rounded-md cursor-pointer hover:bg-white/20 hover:scale-105 transition-all duration-300">
                          <Upload className="mr-2 h-4 w-4" />
                          Logo hochladen
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </label>
                        <p className="text-sm text-white/70 mt-2">
                          Empfohlene Größe: 512x512 Pixel
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-white">Geschäftsbilder</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {businessImages.map((url, index) => (
                        <div key={url} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-white/20 backdrop-blur-2xl bg-white/5">
                            <img
                              src={url}
                              alt={`Geschäftsbild ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveBusinessImage(url)}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 backdrop-blur-2xl text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/80 hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-video rounded-lg border-2 border-dashed border-white/20 backdrop-blur-2xl bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 mx-auto text-white/70" />
                          <p className="text-sm text-white/70 mt-2">Bilder hinzufügen</p>
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
                    <p className="text-sm text-white/70 mt-2">
                      Empfohlene Größe: 1200x800 Pixel
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Öffnungszeiten Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Öffnungszeiten
                </h2>
                <p className="text-white/70 text-sm mt-2">Definieren Sie die Öffnungszeiten des Partners</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-4">
                  {timeSlots.map(slot => (
                    <div key={slot.id} className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-white">Zeitraum</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTimeSlot(slot.id)}
                          className="text-red-300 hover:text-red-200 hover:bg-red-500/20 backdrop-blur-2xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Von</Label>
                          <Input
                            type="time"
                            value={slot.from}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'from', e.target.value)}
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Bis</Label>
                          <Input
                            type="time"
                            value={slot.to}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'to', e.target.value)}
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Gültig an</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                            <Badge
                              key={day}
                              variant={slot.days.includes(day as WeekdayKey) ? "default" : "outline"}
                              className="cursor-pointer backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                              onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                            >
                              {dayName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 shadow-lg">
                    <h4 className="font-medium text-white">Neuer Zeitraum</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Von</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.from}
                          onChange={(e) => 
                            setNewTimeSlot(prev => ({ ...prev, from: e.target.value }))
                          }
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Bis</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.to}
                          onChange={(e) => 
                            setNewTimeSlot(prev => ({ ...prev, to: e.target.value }))
                          }
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Gültig an</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                          <Badge
                            key={day}
                            variant={newTimeSlot.days.includes(day as WeekdayKey) ? "default" : "outline"}
                            className="cursor-pointer backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                            onClick={() => toggleDayForNewTimeSlot(day as WeekdayKey)}
                          >
                            {dayName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={addTimeSlot} 
                      className="w-full backdrop-blur-2xl bg-white/15 border border-white/20 text-white hover:bg-white/25 hover:scale-105 transition-all duration-300"
                      disabled={newTimeSlot.days.length === 0}
                    >
                      Zeitraum hinzufügen
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Nuernbergspots Review Card */}
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Nuernbergspots Review
                </h2>
                <p className="text-white/70 text-sm mt-2">Bewertung und Bilder des Partners</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Review Text</Label>
                    <Textarea
                      value={editReview.reviewText || ''}
                      onChange={(e) => setEditReview(prev => ({
                        ...prev,
                        reviewText: e.target.value,
                      }))}
                      placeholder="Geben Sie hier die Review ein..."
                      className="min-h-[100px] backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-white">Review Bilder</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {editReview.reviewImageUrls?.map((url, index) => (
                        <div key={url} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden border-2 border-dashed border-white/20 backdrop-blur-2xl bg-white/5">
                            <img
                              src={url}
                              alt={`Review Bild ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveImage(url)}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 backdrop-blur-2xl text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/80 hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-video rounded-lg border-2 border-dashed border-white/20 backdrop-blur-2xl bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 mx-auto text-white/70" />
                          <p className="text-sm text-white/70 mt-2">Bilder hinzufügen</p>
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/businesses')}
                className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                Abbrechen
              </Button>
              <Button 
                onClick={handleUpdateBusiness} 
                disabled={isSaving}
                className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-600/80 border border-white/20 text-white hover:from-green-600/80 hover:to-emerald-700/80 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {isSaving ? 'Speichert...' : 'Änderungen speichern'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 