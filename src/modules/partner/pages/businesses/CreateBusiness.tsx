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
import { LocationSearch, LocationResult } from "@/components/ui/LocationSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";


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
      tiktok: ''
    },
    openingHours: {} as Record<string, string>, 
    status: BusinessStatus.PENDING,
    imageUrls: [] as string[],
    keywordIds: [] as string[],
    isPromoted: false
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', openTime: '09:00', closeTime: '18:00', days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'] }
  ]);
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, 'id'>>({
    openTime: '09:00',
    closeTime: '18:00',
    days: []
  });
  const [detailedTimeSlots, setDetailedTimeSlots] = useState<DetailedTimeSlot[]>([]);
  const [newDetailedTimeSlot, setNewDetailedTimeSlot] = useState<Omit<DetailedTimeSlot, 'id'>>({
    from: '09:00',
    to: '18:00',
    day: 'Montag'
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
      toast.error("Fehler beim Laden der Kategorien", {
        description: "Die Kategorien konnten nicht geladen werden.",
      });
    }
  };

  const loadKeywordsForCategories = async (categoryIds: string[]) => {
    try {
      // Lade die ausgewählten Kategorien
      const selectedCategories = categories.filter(category => 
        categoryIds.includes(category.id)
      );

      // Sammle alle Keyword-IDs aus den ausgewählten Kategorien
      const keywordIds = selectedCategories
        .flatMap(category => category.keywords || [])
        .map(keyword => keyword.id);

      // Entferne Duplikate
      const uniqueKeywordIds = [...new Set(keywordIds)];

      // Lade die Keywords
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

  const handleInputChange = (field: keyof typeof newBusiness, value: any) => {
    setNewBusiness(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;
    
    setNewBusiness(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng
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
          categoryIds: prev.categoryIds.filter(id => id !== categoryId)
        };
      } else {
        if (prev.categoryIds.length >= 3) {
          toast.error("Maximale Anzahl an Kategorien erreicht", {
            description: "Sie können maximal 3 Kategorien auswählen.",
          });
          return prev;
        }
        return {
          ...prev,
          categoryIds: [...prev.categoryIds, categoryId]
        };
      }
    });
  };

  const handleTimeSlotChange = (id: string, field: keyof Omit<TimeSlot, 'id'>, value: any) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
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
    setNewTimeSlot({ openTime: '09:00', closeTime: '18:00', days: [] });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
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

  const addDetailedTimeSlot = () => {
    if (!newDetailedTimeSlot.day) {
      toast.error("Bitte wählen Sie einen Tag aus", {
        description: "Ein Zeitraum muss für einen Tag gelten.",
      });
      return;
    }

    const id = Date.now().toString();
    setDetailedTimeSlots(prev => [...prev, { ...newDetailedTimeSlot, id }]);
    setNewDetailedTimeSlot({
      from: '09:00',
      to: '18:00',
      day: 'Montag'
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
            to: slot.closeTime
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
        tiktok: newBusiness.contact.tiktok || undefined
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
          longitude: newBusiness.longitude
        },
        contact: cleanedContact,
        detailedOpeningHours: formattedDetailedOpeningHours,
        keywordIds: selectedKeywords
      };
      
      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      await businessService.createBusiness(businessToCreate);
      toast.success("Geschäft erstellt", {
        description: "Das Geschäft wurde erfolgreich erstellt.",
      });
      navigate('/businesses');
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error("Fehler beim Erstellen des Geschäfts", {
        description: "Das Geschäft konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/businesses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-2xl font-bold">Neues Geschäft erstellen</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geschäftsdetails</CardTitle>
          <CardDescription>
            Füllen Sie alle notwendigen Informationen aus, um ein neues Geschäft zu erstellen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name des Geschäfts</Label>
            <Input
              id="name"
              value={newBusiness.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="z.B. Café Sonnenschein"
            />
            <p className="text-sm text-muted-foreground">
              Der offizielle Name des Geschäfts, wie er angezeigt werden soll.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={newBusiness.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschreiben Sie das Geschäft im Detail..."
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Eine ausführliche Beschreibung des Geschäfts. Nennen Sie wichtige Details wie Angebot, Besonderheiten oder Geschichte.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Kategorien (max. 3)</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category.id}
                  variant={newBusiness.categoryIds.includes(category.id) ? "default" : "outline"}
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
                    variant={selectedKeywords.includes(keyword.id) ? "default" : "outline"}
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

          <div className="space-y-2">
            <Label htmlFor="benefit">Benefit für Nutzer</Label>
            <Input
              id="benefit"
              value={newBusiness.benefit}
              onChange={(e) => {
                const value = e.target.value.slice(0, 100);
                handleInputChange('benefit', value);
              }}
              placeholder="z.B. 10% Rabatt auf alle Getränke"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground">
              Beschreiben Sie kurz (max. 100 Zeichen), welchen Vorteil Nutzer in diesem Geschäft erhalten.
              <span className="ml-2 text-xs">
                {newBusiness.benefit.length}/100 Zeichen
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <LocationSearch
              value={searchValue}
              onChange={handleLocationSelect}
              placeholder="Adresse suchen..."
              debounce={1000}
            />
            {newBusiness.address && (
              <div className="text-sm text-muted-foreground mt-2">
                Ausgewählte Adresse: {newBusiness.address}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Suchen Sie die Adresse. Die Koordinaten werden automatisch ermittelt.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Kontaktinformationen</h3>
            <p className="text-sm text-muted-foreground">
              Diese Informationen sind optional und können später vom Geschäftsinhaber ergänzt werden.
            </p>

            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="isPromoted"
                checked={newBusiness.isPromoted}
                onCheckedChange={(checked) => handleInputChange('isPromoted', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="isPromoted">Als "Highlight" markieren</Label>
                <p className="text-sm text-muted-foreground">
                  {newBusiness.isPromoted 
                    ? 'Dieser Partner wird als Highlight angezeigt ✨' 
                    : 'Markiere diesen Partner als Highlight'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newBusiness.contact.email}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    contact: { ...newBusiness.contact, email: e.target.value }
                  })}
                  placeholder="kontakt@beispiel.de"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newBusiness.contact.phoneNumber}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    contact: { ...newBusiness.contact, phoneNumber: e.target.value }
                  })}
                  placeholder="+49 123 456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={newBusiness.contact.website}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    contact: { ...newBusiness.contact, website: e.target.value }
                  })}
                  placeholder="https://www.beispiel.de"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram (optional)</Label>
                <Input
                  id="instagram"
                  value={newBusiness.contact.instagram}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    contact: { ...newBusiness.contact, instagram: e.target.value }
                  })}
                  placeholder="@beispiel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook (optional)</Label>
                <Input
                  id="facebook"
                  value={newBusiness.contact.facebook}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    contact: { ...newBusiness.contact, facebook: e.target.value }
                  })}
                  placeholder="beispiel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok (optional)</Label>
                <Input
                  id="tiktok"
                  value={newBusiness.contact.tiktok}
                  onChange={(e) => setNewBusiness({
                    ...newBusiness,
                    contact: { ...newBusiness.contact, tiktok: e.target.value }
                  })}
                  placeholder="@beispiel"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Öffnungszeiten</Label>
            <Card>
              <CardHeader>
                <CardTitle>Öffnungszeiten</CardTitle>
                <CardDescription>
                  Fügen Sie Zeiträume hinzu und wählen Sie die Tage aus, an denen diese gelten sollen.
                  Sie können mehrere Zeiträume für den gleichen Tag hinzufügen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {timeSlots.map(slot => (
                    <div key={slot.id} className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Zeitraum</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTimeSlot(slot.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Von</Label>
                          <Input
                            type="time"
                            value={slot.openTime}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'openTime', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bis</Label>
                          <Input
                            type="time"
                            value={slot.closeTime}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'closeTime', e.target.value)}
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
                              className="cursor-pointer"
                              onClick={() => toggleDayForTimeSlot(day as WeekdayKey, slot.id)}
                            >
                              {dayName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h4 className="font-medium">Neuer Zeitraum</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Von</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.openTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, openTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bis</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.closeTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, closeTime: e.target.value })}
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
                            className="cursor-pointer"
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
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate('/businesses')}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Wird erstellt...' : 'Geschäft erstellen'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 