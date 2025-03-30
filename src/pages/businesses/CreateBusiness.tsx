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
import { ArrowLeft, Facebook, Instagram, Twitter } from 'lucide-react';
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
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag'
} as const;

type WeekdayKey = keyof typeof WEEKDAYS;

interface OpeningHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
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
    categoryId: '',
    address: '',
    benefit: '',
    latitude: 0,
    longitude: 0,
    phoneNumber: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    openingHours: {} as Record<string, string>,
    status: BusinessStatus.PENDING,
    imageUrls: [] as string[],
    keywordIds: [] as string[]
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);
  const [openingHours, setOpeningHours] = useState<Record<WeekdayKey, OpeningHours>>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (newBusiness.categoryId) {
      loadKeywordsForCategory(newBusiness.categoryId);
    }
  }, [newBusiness.categoryId]);

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

  const loadKeywordsForCategory = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (category && category.keywords) {
        const keywordPromises = category.keywords.map(keyword => keywordService.getKeyword(keyword.id));
        const fetchedKeywords = await Promise.all(keywordPromises);
        setKeywords(fetchedKeywords);
      }
    } catch (error) {
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

  const handleOpeningHoursChange = (
    day: WeekdayKey,
    field: keyof OpeningHours,
    value: string | boolean
  ) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
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

      // Formatiere Öffnungszeiten für die API
      const formattedOpeningHours: Record<string, string> = {};
      Object.entries(openingHours).forEach(([day, hours]) => {
        if (hours.isOpen) {
          formattedOpeningHours[day] = `${hours.openTime}-${hours.closeTime}`;
        } else {
          formattedOpeningHours[day] = 'closed';
        }
      });

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
        contact: {
          phoneNumber: newBusiness.phoneNumber,
          email: newBusiness.email,
          website: newBusiness.website,
          socialMedia: {
            facebook: newBusiness.facebook,
            instagram: newBusiness.instagram,
            twitter: newBusiness.twitter
          }
        },
        openingHours: formattedOpeningHours,
        keywordIds: selectedKeywords
      };
      
      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      await businessService.createBusiness(businessToCreate);
      toast.success("Geschäft erstellt", {
        description: "Das Geschäft wurde erfolgreich erstellt.",
      });
      navigate('/businesses');
    } catch (error) {
      toast.error("Fehler beim Erstellen", {
        description: "Das Geschäft konnte nicht erstellt werden. Bitte überprüfen Sie Ihre Eingaben.",
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
            <Label htmlFor="categoryId">Kategorie</Label>
            <Select
              value={newBusiness.categoryId}
              onValueChange={(value) => handleInputChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Wählen Sie die passendste Kategorie für das Geschäft.
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

          <div className="space-y-2">
            <Label>Kontaktinformationen</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Telefon</Label>
                <Input
                  id="phoneNumber"
                  value={newBusiness.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+49 911 12345678"
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newBusiness.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="kontakt@beispiel.de"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newBusiness.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.beispiel.de"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Geben Sie die Kontaktmöglichkeiten des Geschäfts an. Mindestens eine Kontaktmöglichkeit sollte angegeben werden.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Social Media</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                <Input
                  value={newBusiness.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  placeholder="Facebook URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                <Input
                  value={newBusiness.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="Instagram URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                <Input
                  value={newBusiness.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="Twitter URL"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Fügen Sie die Social-Media-Profile des Geschäfts hinzu.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Öffnungszeiten</Label>
            <div className="space-y-4 border rounded-lg p-4">
              {(Object.entries(WEEKDAYS) as [WeekdayKey, string][]).map(([day, dayName]) => (
                <div key={day} className="grid grid-cols-[auto_1fr_1fr] gap-4 items-center">
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <Switch
                      checked={openingHours[day].isOpen}
                      onCheckedChange={(checked) => handleOpeningHoursChange(day, 'isOpen', checked)}
                    />
                    <Label>{dayName}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={openingHours[day].openTime}
                      onChange={(e) => handleOpeningHoursChange(day, 'openTime', e.target.value)}
                      disabled={!openingHours[day].isOpen}
                    />
                    <span>bis</span>
                    <Input
                      type="time"
                      value={openingHours[day].closeTime}
                      onChange={(e) => handleOpeningHoursChange(day, 'closeTime', e.target.value)}
                      disabled={!openingHours[day].isOpen}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Legen Sie die Öffnungszeiten für jeden Tag fest. Deaktivieren Sie den Schalter für geschlossene Tage.
            </p>
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