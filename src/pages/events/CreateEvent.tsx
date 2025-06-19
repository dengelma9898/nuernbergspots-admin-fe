import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, DailyTimeSlot } from '@/models/events';
import { EventCategory } from '@/models/event-category';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LocationSearch, LocationResult } from "@/components/ui/LocationSearch";
import { getIconComponent } from '@/utils/iconUtils';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number | null;
  ticketsNeeded: boolean;
  imageUrls: string[];
  favoriteCount: number;
  isPromoted: boolean;
  categoryId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  socialMedia: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
  };
  dailyTimeSlots: DailyTimeSlot[];
}

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const eventService = useEventService();
  const eventCategoryService = useEventCategoryService();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    address: '',
    latitude: 0,
    longitude: 0,
    price: null,
    ticketsNeeded: false,
    imageUrls: [],
    favoriteCount: 0,
    isPromoted: false,
    categoryId: null,
    contactEmail: null,
    contactPhone: null,
    website: null,
    socialMedia: {
      instagram: null,
      facebook: null,
      tiktok: null
    },
    dailyTimeSlots: []
  });
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await eventCategoryService.getCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        setNewEvent(prev => ({
          ...prev,
          categoryId: fetchedCategories[0].id
        }));
      }
    } catch (error) {
      toast.error("Fehler beim Laden der Kategorien", {
        description: "Die Kategorien konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleInputChange = (field: keyof typeof newEvent, value: any) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) return;
    
    setNewEvent(prev => ({
      ...prev,
      address: location.address.label,
      latitude: location.position.lat,
      longitude: location.position.lng
    }));
    setSearchValue(location);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const eventToCreate = {
        ...newEvent,
        location: {
          address: newEvent.address,
          latitude: newEvent.latitude,
          longitude: newEvent.longitude
        }
      };
      console.log('eventToCreate', eventToCreate);
      // @ts-ignore - Wir wissen, dass das Format jetzt korrekt ist
      await eventService.createEvent(eventToCreate);
      toast.success("Event erstellt", {
        description: "Das Event wurde erfolgreich erstellt.",
      });
      navigate('/events');
    } catch (error) {
      toast.error("Fehler beim Erstellen", {
        description: "Das Event konnte nicht erstellt werden. Bitte überprüfen Sie Ihre Eingaben.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTimeSlots = () => {
    if (!newEvent.startDate || !newEvent.endDate) return;

    const days = eachDayOfInterval({
      start: parseISO(newEvent.startDate),
      end: parseISO(newEvent.endDate)
    });

    const newTimeSlots = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      from: undefined,
      to: undefined
    }));
    console.log('newTimeSlots', newTimeSlots);
    setNewEvent(prev => ({
      ...prev,
      dailyTimeSlots: newTimeSlots
    }));
  };

  useEffect(() => {
    generateDailyTimeSlots();
  }, [newEvent.startDate, newEvent.endDate]);

  const updateTimeSlot = (date: string, field: 'from' | 'to', value: string) => {
    setNewEvent(prev => ({
      ...prev,
      dailyTimeSlots: prev.dailyTimeSlots.map(slot =>
        slot.date === date ? { ...slot, [field]: value } : slot
      )
    }));
  };

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

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/events')}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl p-2 border w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Neues Event erstellen
              </h1>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Event Details</h2>
              <p className="text-white/70 text-sm mt-1">
                Füllen Sie alle notwendigen Informationen aus, um ein neues Event zu erstellen.
              </p>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">Titel</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="z.B. Sommerfest 2024"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                />
                <p className="text-xs text-white/60">
                  Ein prägnanter Titel, der das Event gut beschreibt.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beschreiben Sie das Event im Detail..."
                  className="min-h-[100px] backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                />
                <p className="text-xs text-white/60">
                  Eine ausführliche Beschreibung des Events. Nennen Sie wichtige Details wie Programm, Highlights oder besondere Hinweise.
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white font-medium">Startdatum</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newEvent.startDate.split('T')[0]}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white font-medium">Enddatum</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.endDate.split('T')[0]}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Daily Time Slots */}
              {newEvent.dailyTimeSlots.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white font-medium">Tägliche Zeitangaben (optional)</Label>
                  </div>
                  
                  <div className="space-y-4">
                    {newEvent.dailyTimeSlots.map((slot) => (
                      <div key={slot.date} className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="font-medium text-white">
                            {format(parseISO(slot.date), 'EEEE, dd.MM.yyyy', { locale: de })}
                          </div>
                          <Input
                            type="time"
                            value={slot.from || ''}
                            onChange={(e) => updateTimeSlot(slot.date, 'from', e.target.value)}
                            placeholder="Von"
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                          />
                          <Input
                            type="time"
                            value={slot.to || ''}
                            onChange={(e) => updateTimeSlot(slot.date, 'to', e.target.value)}
                            placeholder="Bis"
                            className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Adresse</Label>
                <div className="backdrop-blur-2xl bg-white/10 border-white/20 rounded-xl">
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen..."
                    debounce={1000}
                    className="border-0 bg-transparent text-white placeholder:text-white/60 focus:ring-white/20"
                  />
                </div>
                <p className="text-xs text-white/60">
                  Der genaue Veranstaltungsort. Suchen Sie nach einer Adresse und wählen Sie den passenden Eintrag aus.
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white font-medium">Preis (in €)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newEvent.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                />
                <p className="text-xs text-white/60">
                  Der Eintrittspreis in Euro. Lassen Sie das Feld leer oder geben Sie 0 ein für kostenlose Events.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white font-medium">Kategorie</Label>
                <Select
                  value={newEvent.categoryId || ''}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger className="backdrop-blur-2xl bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl">
                    <SelectValue placeholder="Kategorie auswählen" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-3xl bg-white/10 border border-white/20 rounded-xl">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-white/20 focus:bg-white/20">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center">
                            {getIconComponent(category.iconName)}
                          </span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60">
                  Wählen Sie eine passende Kategorie für Ihr Event aus.
                </p>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="ticketsNeeded"
                      checked={newEvent.ticketsNeeded}
                      onCheckedChange={(checked) => handleInputChange('ticketsNeeded', checked)}
                      className="data-[state=checked]:bg-white/30"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="ticketsNeeded" className="text-white font-medium">Tickets erforderlich</Label>
                      <p className="text-xs text-white/60">
                        Aktivieren Sie diese Option, wenn Besucher Tickets im Voraus erwerben müssen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isPromoted"
                      checked={newEvent.isPromoted}
                      onCheckedChange={(checked) => handleInputChange('isPromoted', checked)}
                      className="data-[state=checked]:bg-white/30"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isPromoted" className="text-white font-medium">Als "Highlight" markieren</Label>
                      <p className="text-xs text-white/60">
                        Aktiviere diese Option, um das Event als "Highlight" zu kennzeichnen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-white font-medium text-lg">Kontaktinformationen</Label>
                
                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-white/90">E-Mail</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={newEvent.contactEmail || ''}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="kontakt@beispiel.de"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-white/90">Telefon</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={newEvent.contactPhone || ''}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+49 123 4567890"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="website" className="text-white/90">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={newEvent.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.beispiel.de"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-white/90 text-base">Social Media</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-white/80 text-sm">Instagram</Label>
                        <Input
                          id="instagram"
                          value={newEvent.socialMedia.instagram || ''}
                          onChange={(e) => setNewEvent(prev => ({
                            ...prev,
                            socialMedia: {
                              ...prev.socialMedia,
                              instagram: e.target.value
                            }
                          }))}
                          placeholder="@benutzername"
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-white/80 text-sm">Facebook</Label>
                        <Input
                          id="facebook"
                          value={newEvent.socialMedia.facebook || ''}
                          onChange={(e) => setNewEvent(prev => ({
                            ...prev,
                            socialMedia: {
                              ...prev.socialMedia,
                              facebook: e.target.value
                            }
                          }))}
                          placeholder="@seitename"
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tiktok" className="text-white/80 text-sm">TikTok</Label>
                        <Input
                          id="tiktok"
                          value={newEvent.socialMedia.tiktok || ''}
                          onChange={(e) => setNewEvent(prev => ({
                            ...prev,
                            socialMedia: {
                              ...prev.socialMedia,
                              tiktok: e.target.value
                            }
                          }))}
                          placeholder="@benutzername"
                          className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/60 mt-4">
                    Alle Kontaktinformationen sind optional. Fügen Sie nur die Informationen hinzu, die Sie öffentlich teilen möchten.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-white/10">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/events')}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl w-full sm:w-auto"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-green-400/30 text-white hover:from-green-400/90 hover:to-emerald-400/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg w-full sm:w-auto"
                >
                  {loading ? 'Wird erstellt...' : 'Event erstellen'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 