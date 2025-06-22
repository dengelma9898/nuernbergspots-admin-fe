import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business, BusinessStatus } from '@/models/business';
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
import { ArrowLeft, Trash2 } from 'lucide-react';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

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
  openTime: string;
  closeTime: string;
  days: WeekdayKey[];
}

interface DetailedTimeSlot {
  id: string;
  from: string;
  to: string;
  day: WeekdayKey;
}

export const CreateBusiness: React.FC = () => {
  const navigate = useNavigate();
  const businessService = useBusinessService();
  const categoryService = useBusinessCategoryService();
  const keywordService = useKeywordService();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    categoryIds: [] as string[],
    address: '',
    benefit: '',
    latitude: 0,
    longitude: 0,
    contact: {
      phoneNumber: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
    },
    openingHours: {} as Record<string, string>,
    status: BusinessStatus.PENDING,
    imageUrls: [] as string[],
    keywordIds: [] as string[],
    isPromoted: false,
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      openTime: '09:00',
      closeTime: '18:00',
      days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
    },
  ]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    openTime: '09:00',
    closeTime: '18:00',
    days: [],
  });
  const [detailedTimeSlots, setDetailedTimeSlots] = useState<DetailedTimeSlot[]>([]);
  const [newDetailedTimeSlot, setNewDetailedTimeSlot] = useState<Omit<DetailedTimeSlot, 'id'>>({
    from: '09:00',
    to: '18:00',
    day: 'Montag',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (newBusiness.categoryIds.length > 0) {
      loadKeywordsForCategories(newBusiness.categoryIds);
    } else {
      setKeywords([]);
    }
  }, [newBusiness.categoryIds]);

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

  const loadKeywordsForCategories = async (categoryIds: string[]) => {
    try {
      // Lade die ausgewählten Kategorien
      const selectedCategories = categories.filter(category => categoryIds.includes(category.id));

      // Sammle alle Keyword-IDs aus den ausgewählten Kategorien
      const keywordIds = selectedCategories
        .flatMap(category => category.keywords || [])
        .map(keyword => keyword.id);

      // Entferne Duplikate
      const uniqueKeywordIds = [...new Set(keywordIds)];

      // Lade die Keywords
      const keywordPromises = uniqueKeywordIds.map(id => keywordService.getKeyword(id));

      const fetchedKeywords = await Promise.all(keywordPromises);
      setKeywords(fetchedKeywords);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
      toast.error('Fehler beim Laden der Keywords', {
        description: 'Die Keywords konnten nicht geladen werden.',
      });
    }
  };

  const handleInputChange = (field: keyof typeof newBusiness, value: any) => {
    setNewBusiness(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;

    setNewBusiness(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng,
    }));
    setSearchValue(location);
  };

  const toggleKeyword = (keywordId: string) => {
    setSelectedKeywords(prev => {
      const isSelected = prev.includes(keywordId);
      if (isSelected) {
        return prev.filter(id => id !== keywordId);
      } else {
        return [...prev, keywordId];
      }
    });
  };

  const toggleCategory = (categoryId: string) => {
    setNewBusiness(prev => {
      const isSelected = prev.categoryIds.includes(categoryId);
      if (isSelected) {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter(id => id !== categoryId),
        };
      } else {
        if (prev.categoryIds.length >= 3) {
          toast.error('Maximale Anzahl an Kategorien erreicht', {
            description: 'Sie können maximal 3 Kategorien auswählen.',
          });
          return prev;
        }
        return {
          ...prev,
          categoryIds: [...prev.categoryIds, categoryId],
        };
      }
    });
  };

  const handleTimeSlotChange = (id: string, field: keyof Omit<TimeSlot, 'id'>, value: any) => {
    setTimeSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, [field]: value } : slot)));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.days.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Tag aus', {
        description: 'Ein Zeitraum muss für mindestens einen Tag gelten.',
      });
      return;
    }

    const id = Date.now().toString();
    setTimeSlots(prev => [...prev, { ...newTimeSlot, id }]);
    setNewTimeSlot({ openTime: '09:00', closeTime: '18:00', days: [] });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
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

  const addDetailedTimeSlot = () => {
    if (!newDetailedTimeSlot.day) {
      toast.error('Bitte wählen Sie einen Tag aus', {
        description: 'Ein Zeitraum muss für einen Tag gelten.',
      });
      return;
    }

    const id = Date.now().toString();
    setDetailedTimeSlots(prev => [...prev, { ...newDetailedTimeSlot, id }]);
    setNewDetailedTimeSlot({
      from: '09:00',
      to: '18:00',
      day: 'Montag',
    });
  };

  const removeDetailedTimeSlot = (id: string) => {
    setDetailedTimeSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const addressParts = newBusiness.address.split(',');
      const streetWithNumber = addressParts[0].trim();
      const [street, houseNumber] = streetWithNumber.split(' ').reduce(
        ([str, num], part) => {
          if (/\d/.test(part)) {
            return [str, (num + ' ' + part).trim()];
          }
          return [(str + ' ' + part).trim(), num];
        },
        ['', '']
      );

      const postalAndCity = addressParts[1]?.trim().split(' ') || [];
      const postalCode = postalAndCity[0] || '';

      // Formatiere detaillierte Öffnungszeiten
      const formattedDetailedOpeningHours: Record<string, Array<{ from: string; to: string }>> = {};

      // Setze die Öffnungszeiten basierend auf den Zeiträumen
      timeSlots.forEach(slot => {
        slot.days.forEach(day => {
          if (!formattedDetailedOpeningHours[day]) {
            formattedDetailedOpeningHours[day] = [];
          }
          formattedDetailedOpeningHours[day].push({
            from: slot.openTime,
            to: slot.closeTime,
          });
        });
      });

      // Bereinige die Kontaktdaten - leere Strings werden zu undefined
      const cleanedContact = {
        email: newBusiness.contact.email || undefined,
        phoneNumber: newBusiness.contact.phoneNumber || undefined,
        website: newBusiness.contact.website || undefined,
        instagram: newBusiness.contact.instagram || undefined,
        facebook: newBusiness.contact.facebook || undefined,
        tiktok: newBusiness.contact.tiktok || undefined,
      };

      const businessToCreate = {
        ...newBusiness,
        hasAccount: false,
        isAdmin: true,
        address: {
          street,
          houseNumber,
          postalCode,
          city: 'Nürnberg',
          latitude: newBusiness.latitude,
          longitude: newBusiness.longitude,
        },
        contact: cleanedContact,
        detailedOpeningHours: formattedDetailedOpeningHours,
        keywordIds: selectedKeywords,
      };

      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      await businessService.createBusiness(businessToCreate);
      toast.success('Geschäft erstellt', {
        description: 'Das Geschäft wurde erfolgreich erstellt.',
      });
      navigate('/businesses');
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error('Fehler beim Erstellen des Geschäfts', {
        description:
          'Das Geschäft konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1000ms' }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '500ms' }}
      ></div>
      <div
        className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '700ms' }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '300ms' }}
      ></div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-4 py-6 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/businesses')}
                className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Button>
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Neues Geschäft erstellen
              </h1>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Geschäftsdetails
              </h2>
              <p className="text-white/70 mt-1">
                Füllen Sie alle notwendigen Informationen aus, um ein neues Geschäft zu erstellen.
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-8">
              {/* Business Name */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-3">
                <Label htmlFor="name" className="text-white font-medium">
                  Name des Geschäfts
                </Label>
                <Input
                  id="name"
                  value={newBusiness.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="z.B. Café Sonnenschein"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                />
                <p className="text-sm text-white/60">
                  Der offizielle Name des Geschäfts, wie er angezeigt werden soll.
                </p>
              </div>

              {/* Description */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-3">
                <Label htmlFor="description" className="text-white font-medium">
                  Beschreibung
                </Label>
                <Textarea
                  id="description"
                  value={newBusiness.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Beschreiben Sie das Geschäft im Detail..."
                  className="min-h-[100px] backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                />
                <p className="text-sm text-white/60">
                  Eine ausführliche Beschreibung des Geschäfts. Nennen Sie wichtige Details wie
                  Angebot, Besonderheiten oder Geschichte.
                </p>
              </div>

              {/* Categories */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-3">
                <Label className="text-white font-medium">Kategorien (max. 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`backdrop-blur-2xl border px-3 py-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105 ${
                        newBusiness.categoryIds.includes(category.id)
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  Wählen Sie bis zu 3 passende Kategorien für das Geschäft aus.
                </p>
              </div>

              {/* Keywords */}
              {keywords.length > 0 && (
                <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-3">
                  <Label className="text-white font-medium">Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(keyword => (
                      <div
                        key={keyword.id}
                        onClick={() => toggleKeyword(keyword.id)}
                        className={`backdrop-blur-2xl border px-3 py-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedKeywords.includes(keyword.id)
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {keyword.name}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-white/60">
                    Wählen Sie passende Keywords aus, um das Geschäft besser auffindbar zu machen.
                  </p>
                </div>
              )}

              {/* Benefit */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-3">
                <Label htmlFor="benefit" className="text-white font-medium">
                  Benefit für Nutzer
                </Label>
                <Input
                  id="benefit"
                  value={newBusiness.benefit}
                  onChange={e => {
                    const value = e.target.value.slice(0, 100);
                    handleInputChange('benefit', value);
                  }}
                  placeholder="z.B. 10% Rabatt auf alle Getränke"
                  maxLength={100}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                />
                <p className="text-sm text-white/60">
                  Beschreiben Sie kurz (max. 100 Zeichen), welchen Vorteil Nutzer in diesem Geschäft
                  erhalten.
                  <span className="ml-2 text-xs">{newBusiness.benefit.length}/100 Zeichen</span>
                </p>
              </div>

              {/* Address */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-3">
                <Label className="text-white font-medium">Adresse</Label>
                <div className="[&_input]:backdrop-blur-2xl [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder:text-white/60 [&_input]:focus:border-white/40 [&_input]:focus:ring-white/20">
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                  />
                </div>
                {newBusiness.address && (
                  <div className="text-sm text-white/70 mt-2">
                    Ausgewählte Adresse: {newBusiness.address}
                  </div>
                )}
                <p className="text-sm text-white/60">
                  Suchen Sie die Adresse. Die Koordinaten werden automatisch ermittelt.
                </p>
              </div>

              {/* Contact Information */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-4">
                <h3 className="text-lg font-medium text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Kontaktinformationen
                </h3>
                <p className="text-sm text-white/60">
                  Diese Informationen sind optional und können später vom Geschäftsinhaber ergänzt
                  werden.
                </p>

                <div className="backdrop-blur-2xl bg-white/5 rounded-xl border border-white/10 p-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isPromoted"
                      checked={newBusiness.isPromoted}
                      onCheckedChange={checked => handleInputChange('isPromoted', checked)}
                      className="data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-white/10"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isPromoted" className="text-white font-medium">
                        Als "Highlight" markieren
                      </Label>
                      <p className="text-sm text-white/70">
                        {newBusiness.isPromoted
                          ? 'Dieser Partner wird als Highlight angezeigt ✨'
                          : 'Markiere diesen Partner als Highlight'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      E-Mail (optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newBusiness.contact.email}
                      onChange={e =>
                        setNewBusiness({
                          ...newBusiness,
                          contact: { ...newBusiness.contact, email: e.target.value },
                        })
                      }
                      placeholder="kontakt@beispiel.de"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Telefon (optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newBusiness.contact.phoneNumber}
                      onChange={e =>
                        setNewBusiness({
                          ...newBusiness,
                          contact: { ...newBusiness.contact, phoneNumber: e.target.value },
                        })
                      }
                      placeholder="+49 123 456789"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">
                      Website (optional)
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={newBusiness.contact.website}
                      onChange={e =>
                        setNewBusiness({
                          ...newBusiness,
                          contact: { ...newBusiness.contact, website: e.target.value },
                        })
                      }
                      placeholder="https://www.beispiel.de"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-white">
                      Instagram (optional)
                    </Label>
                    <Input
                      id="instagram"
                      value={newBusiness.contact.instagram}
                      onChange={e =>
                        setNewBusiness({
                          ...newBusiness,
                          contact: { ...newBusiness.contact, instagram: e.target.value },
                        })
                      }
                      placeholder="@beispiel"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-white">
                      Facebook (optional)
                    </Label>
                    <Input
                      id="facebook"
                      value={newBusiness.contact.facebook}
                      onChange={e =>
                        setNewBusiness({
                          ...newBusiness,
                          contact: { ...newBusiness.contact, facebook: e.target.value },
                        })
                      }
                      placeholder="beispiel"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-white">
                      TikTok (optional)
                    </Label>
                    <Input
                      id="tiktok"
                      value={newBusiness.contact.tiktok}
                      onChange={e =>
                        setNewBusiness({
                          ...newBusiness,
                          contact: { ...newBusiness.contact, tiktok: e.target.value },
                        })
                      }
                      placeholder="@beispiel"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-4 space-y-4">
                <div className="mb-2">
                  <h3 className="text-lg font-medium text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Öffnungszeiten
                  </h3>
                  <p className="text-sm text-white/60">
                    Fügen Sie Zeiträume hinzu und wählen Sie die Tage aus, an denen diese gelten
                    sollen. Sie können mehrere Zeiträume für den gleichen Tag hinzufügen.
                  </p>
                </div>
                <div className="space-y-4">
                  {timeSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-white">Zeitraum</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(slot.id)}
                          className="backdrop-blur-2xl bg-red-500/20 text-red-200 hover:bg-red-500/30 hover:scale-105 transition-all duration-300 border border-red-400/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Von</Label>
                          <Input
                            type="time"
                            value={slot.openTime}
                            onChange={e =>
                              handleTimeSlotChange(slot.id, 'openTime', e.target.value)
                            }
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Bis</Label>
                          <Input
                            type="time"
                            value={slot.closeTime}
                            onChange={e =>
                              handleTimeSlotChange(slot.id, 'closeTime', e.target.value)
                            }
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Gültig an</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                            <div
                              key={day}
                              onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                              className={`backdrop-blur-2xl border px-3 py-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105 ${
                                slot.days.includes(day as WeekdayKey)
                                  ? 'bg-white/20 text-white border-white/30'
                                  : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10'
                              }`}
                            >
                              {dayName}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                    <h4 className="font-medium text-white">Neuer Zeitraum</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Von</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.openTime}
                          onChange={e =>
                            setNewTimeSlot({ ...newTimeSlot, openTime: e.target.value })
                          }
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Bis</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.closeTime}
                          onChange={e =>
                            setNewTimeSlot({ ...newTimeSlot, closeTime: e.target.value })
                          }
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Gültig an</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(WEEKDAYS).map(([day, dayName]) => (
                          <div
                            key={day}
                            onClick={() => toggleDayForNewTimeSlot(day as WeekdayKey)}
                            className={`backdrop-blur-2xl border px-3 py-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105 ${
                              newTimeSlot.days.includes(day as WeekdayKey)
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10'
                            }`}
                          >
                            {dayName}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={addTimeSlot}
                      className="w-full backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105"
                      disabled={newTimeSlot.days.length === 0}
                    >
                      Zeitraum hinzufügen
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/businesses')}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  {loading ? 'Wird erstellt...' : 'Geschäft erstellen'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
