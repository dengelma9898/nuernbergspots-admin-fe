import React, { useRef, useState, useEffect } from 'react';
import { format, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Event } from '@/models/events';
import { Download, Settings, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { siInstagram, siFacebook, siTiktok } from 'simple-icons';
import LogoImage from '@/assets/Logo_nuernbergspots.png';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { useEventService } from '@/services/eventService';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface GroupedEvent {
  date: Date;
  events: Event[];
}

interface DesignSettings {
  title: {
    fontSize: number;
    color: string;
    backgroundColor: string;
    borderColor: string;
    shadowColor: string;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    backgroundTransparent: boolean;
  };
  content: {
    backgroundColor: string;
    padding: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
    containerOpacity: number;
  };
  date: {
    fontSize: number;
    color: string;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  event: {
    fontSize: number;
    color: string;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  time: {
    fontSize: number;
    color: string;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  location: {
    fontSize: number;
    color: string;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  logo: {
    size: number;
    opacity: number;
  };
}

const defaultSettings: DesignSettings = {
  title: {
    fontSize: 36,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    shadowColor: '#000000',
    fontFamily: 'league-spartan',
    fontWeight: 700,
    backgroundTransparent: false,
  },
  content: {
    backgroundColor: '#9B1B1A',
    padding: 1.5,
    fontFamily: 'montserrat',
    fontWeight: 400,
    containerOpacity: 1,
  },
  date: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'montserrat',
    fontWeight: 600,
  },
  event: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'montserrat',
    fontWeight: 500,
  },
  time: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'montserrat',
    fontWeight: 400,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'montserrat',
    fontWeight: 400,
  },
  logo: {
    size: 10,
    opacity: 0.9,
  },
};

// Hilfsfunktionen für Farbkonvertierung
const rgbaToHex = (rgba: string): { color: string; opacity: number } => {
  const rgbaMatch = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    return { color: hex, opacity: a };
  }
  return { color: '#000000', opacity: 1 };
};

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const EventImageEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const elementRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings);
  const [events, setEvents] = useState<Event[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const eventService = useEventService();
  const categoryService = useEventCategoryService();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wenn Events über den State übergeben wurden, verwende diese
    if (location.state?.events && !isInitialized) {
      setEvents(location.state.events);
      setCategoryName(location.state.categoryName);
      setCustomTitle(location.state.categoryName);
      setIsInitialized(true);
    } else if (id && !isInitialized) {
      // Ansonsten lade das einzelne Event
      const loadEvent = async () => {
        try {
          const event = await eventService.getEvent(id);
          setEvents([event]);
          
          // Lade die Kategorie separat
          const category = await categoryService.getCategory(event.categoryId!);
          setCategoryName(category.name);
          setCustomTitle(category.name);
          setIsInitialized(true);
        } catch (error) {
          toast.error('Fehler beim Laden des Events', {
            description: 'Das Event konnte nicht geladen werden.',
          });
          navigate('/events');
        }
      };
      loadEvent();
    }
  }, [id, eventService, categoryService, navigate, location.state, isInitialized]);

  const formatDate = (date: string) => {
    try {
      const eventDate = new Date(date);
      const dayStr = format(eventDate, 'EEEEEE', { locale: de }).replace(/^(.)(.?)$/, '$1$2.');
      const dateStr = format(eventDate, 'dd.MM.', { locale: de });
      const timeStr = format(eventDate, 'HH:mm', { locale: de });
      return {
        dayDate: `${dayStr} ${dateStr}`,
        time: timeStr ? `${timeStr} Uhr` : '',
        dayOnly: dayStr,
        dateOnly: dateStr
      };
    } catch (error) {
      console.error('Fehler beim Formatieren des Datums:', error);
      return {
        dayDate: 'Ungültiges Datum',
        time: '',
        dayOnly: '',
        dateOnly: ''
      };
    }
  };

  const formatEventTitle = (event: Event) => {
    if (event.dailyTimeSlots && event.dailyTimeSlots.length > 0) {
      const firstSlot = event.dailyTimeSlots[0];
      const lastSlot = event.dailyTimeSlots[event.dailyTimeSlots.length - 1];
      
      if (firstSlot.date !== lastSlot.date) {
        const { dayOnly, dateOnly } = formatDate(lastSlot.date);
        return `${event.title} (bis ${dayOnly} ${dateOnly})`;
      }
    }
    return event.title;
  };

  const formatAddress = (address: string) => {
    let formatted = address.replace(/\b\d{5}\s*/, '');
    formatted = formatted.replace(/,\s*Deutschland$/i, '');
    formatted = formatted.replace(/\s*Deutschland$/i, '');
    return formatted.trim();
  };

  const groupEventsByDate = (events: Event[]): GroupedEvent[] => {
    const sortedEvents = [...events].sort((a, b) => {
      const aDate = a.dailyTimeSlots?.[0]?.date;
      const bDate = b.dailyTimeSlots?.[0]?.date;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    const groupedEvents: { [key: string]: Event[] } = {};
    
    sortedEvents.forEach(event => {
      const eventDate = event.dailyTimeSlots?.[0]?.date;
      const startDate = new Date(eventDate);
      const dateKey = format(startDate, 'yyyy-MM-dd');
      
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    return Object.entries(groupedEvents).map(([dateStr, events]) => ({
      date: new Date(dateStr),
      events
    }));
  };

  const handleDownload = async () => {
    if (elementRef.current) {
      try {
        const dataUrl = await toPng(elementRef.current, {
          quality: 1.0,
          backgroundColor: 'white',
        });
        const link = document.createElement('a');
        link.download = `${categoryName.toLowerCase()}-events.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Fehler beim Generieren des Bildes:', err);
      }
    }
  };

  const updateSetting = (section: keyof DesignSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBackgroundImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => setBackgroundImage(null);

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/events')} className="hover:bg-accent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Event-Bild Editor</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linke Spalte - Einstellungen */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl">Design-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Tabs defaultValue="title">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="title">
                    <Type className="h-4 w-4 mr-2" />
                    Titel
                  </TabsTrigger>
                  <TabsTrigger value="content">
                    <Palette className="h-4 w-4 mr-2" />
                    Inhalt
                  </TabsTrigger>
                  <TabsTrigger value="logo">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Logo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="title" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-title">Titel Text</Label>
                    <Textarea
                      id="custom-title"
                      value={customTitle}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log('Neuer Titel:', newValue);
                        setCustomTitle(newValue);
                      }}
                      placeholder="Titel eingeben..."
                      className="font-mono min-h-[100px] resize-y"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leer lassen, um den Kategorienamen zu verwenden
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Schriftgröße</Label>
                    <Slider
                      value={[settings.title.fontSize]}
                      onValueChange={([value]) => updateSetting('title', 'fontSize', value)}
                      min={24}
                      max={72}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.title.fontSize}px</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Textfarbe</Label>
                    <ColorPicker
                      value={settings.title.color}
                      onChange={(value) => updateSetting('title', 'color', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hintergrundfarbe</Label>
                    <ColorPicker
                      value={settings.title.backgroundColor}
                      onChange={(value) => updateSetting('title', 'backgroundColor', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rahmenfarbe</Label>
                    <ColorPicker
                      value={settings.title.borderColor}
                      onChange={(value) => updateSetting('title', 'borderColor', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Schattenfarbe</Label>
                    <ColorPicker
                      value={settings.title.shadowColor}
                      onChange={(value) => updateSetting('title', 'shadowColor', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Schriftart</Label>
                    <Select
                      value={settings.title.fontFamily}
                      onValueChange={(value) => updateSetting('title', 'fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Schriftart wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league-spartan">League Spartan</SelectItem>
                        <SelectItem value="montserrat">Montserrat</SelectItem>
                        <SelectItem value="system-ui">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Schriftschnitt</Label>
                    <Select
                      value={settings.title.fontWeight.toString()}
                      onValueChange={(value) => updateSetting('title', 'fontWeight', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Schriftschnitt wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="300">300</SelectItem>
                        <SelectItem value="400">400</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                        <SelectItem value="600">600</SelectItem>
                        <SelectItem value="700">700</SelectItem>
                        <SelectItem value="800">800</SelectItem>
                        <SelectItem value="900">900</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>Hintergrund transparent</Label>
                    <input
                      type="checkbox"
                      checked={settings.title.backgroundTransparent}
                      onChange={e => updateSetting('title', 'backgroundTransparent', e.target.checked)}
                      className="ml-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schriftart</Label>
                    <Select
                      value={settings.content.fontFamily}
                      onValueChange={(value) => updateSetting('content', 'fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Schriftart wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league-spartan">League Spartan</SelectItem>
                        <SelectItem value="montserrat">Montserrat</SelectItem>
                        <SelectItem value="system-ui">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Schriftschnitt</Label>
                    <Select
                      value={settings.content.fontWeight.toString()}
                      onValueChange={(value) => updateSetting('content', 'fontWeight', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Schriftschnitt wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="300">300</SelectItem>
                        <SelectItem value="400">400</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                        <SelectItem value="600">600</SelectItem>
                        <SelectItem value="700">700</SelectItem>
                        <SelectItem value="800">800</SelectItem>
                        <SelectItem value="900">900</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Hintergrundfarbe</Label>
                    <ColorPicker
                      value={settings.content.backgroundColor}
                      onChange={(value) => {
                        updateSetting('content', 'backgroundColor', value);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Container Transparenz</Label>
                    <Slider
                      value={[Math.round(settings.content.containerOpacity * 100)]}
                      onValueChange={([value]) => {
                        updateSetting('content', 'containerOpacity', value / 100);
                      }}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">
                      {Math.round(settings.content.containerOpacity * 100)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Innenabstand</Label>
                    <Slider
                      value={[settings.content.padding]}
                      onValueChange={([value]) => updateSetting('content', 'padding', value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.content.padding}rem</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Datum Schriftgröße</Label>
                    <Slider
                      value={[settings.date.fontSize]}
                      onValueChange={([value]) => updateSetting('date', 'fontSize', value)}
                      min={12}
                      max={24}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.date.fontSize}px</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Event Schriftgröße</Label>
                    <Slider
                      value={[settings.event.fontSize]}
                      onValueChange={([value]) => updateSetting('event', 'fontSize', value)}
                      min={10}
                      max={20}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.event.fontSize}px</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hintergrundbild</Label>
                    <Input type="file" accept="image/*" onChange={handleBackgroundImageChange} />
                    {backgroundImage && (
                      <div className="mt-2 flex items-center gap-4">
                        <img src={backgroundImage} alt="Vorschau" className="h-16 rounded shadow" />
                        <Button variant="outline" onClick={removeBackgroundImage}>Entfernen</Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo-Größe</Label>
                    <Slider
                      value={[settings.logo.size]}
                      onValueChange={([value]) => updateSetting('logo', 'size', value)}
                      min={10}
                      max={40}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{settings.logo.size}rem</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Transparenz</Label>
                    <Slider
                      value={[settings.logo.opacity * 100]}
                      onValueChange={([value]) => updateSetting('logo', 'opacity', value / 100)}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">{Math.round(settings.logo.opacity * 100)}%</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte - Vorschau */}
        <div className="lg:col-span-2">
          <div
            ref={elementRef}
            className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto relative"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="space-y-6">
              <div 
                className="absolute top-4 left-8 z-10"
                style={{
                  transform: 'rotate(-2deg) translateY(-40%)',
                }}
              >
                <h1 
                  className={`text-4xl font-black tracking-tight inline-block whitespace-pre-line ${
                    settings.title.fontFamily === 'league-spartan' ? 'font-league-spartan' :
                    settings.title.fontFamily === 'montserrat' ? 'font-montserrat' :
                    'font-sans'
                  }`}
                  style={{ 
                    color: settings.title.color,
                    fontSize: `${settings.title.fontSize}px`,
                    backgroundColor: settings.title.backgroundTransparent ? 'transparent' : settings.title.backgroundColor,
                    borderRadius: '4px',
                    WebkitTextStroke: '2px white',
                    textShadow: '2px 2px 6px rgba(0,0,0,0.3)',
                    border: `2px solid ${settings.title.borderColor}`,
                    padding: '0.5rem 1rem',
                    fontWeight: settings.title.fontWeight
                  }}
                >
                  {customTitle || categoryName}
                </h1>
              </div>
              
              <div 
                className="space-y-4 rounded-lg overflow-hidden mt-12"
                style={{
                  backgroundColor: hexToRgba(settings.content.backgroundColor, settings.content.containerOpacity),
                  padding: `${settings.content.padding}rem`,
                  paddingBottom: '1rem'
                }}
              >
                {groupedEvents.map((group, groupIndex) => {
                  const { dayDate } = formatDate(group.date.toISOString());
                  return (
                    <div key={groupIndex} className="space-y-2">
                      <div 
                        className={
                          settings.content.fontFamily === 'league-spartan' ? 'font-league-spartan' :
                          settings.content.fontFamily === 'montserrat' ? 'font-montserrat' :
                          'font-sans'
                        }
                        style={{
                          color: settings.date.color,
                          fontSize: `${settings.date.fontSize}px`,
                          fontWeight: settings.content.fontWeight
                        }}
                      >
                        {dayDate}
                      </div>
                      <div className="space-y-1">
                        {group.events.map((event) => {
                          const time = event.dailyTimeSlots?.[0]?.from 
                            ? `${event.dailyTimeSlots[0].from} Uhr`
                            : '';
                          return (
                            <div key={event.id} className="ml-4">
                              <div className="flex items-baseline">
                                <span 
                                  className={`inline-block min-w-[70px] ${
                                    settings.content.fontFamily === 'league-spartan' ? 'font-league-spartan' :
                                    settings.content.fontFamily === 'montserrat' ? 'font-montserrat' :
                                    'font-sans'
                                  }`}
                                  style={{
                                    color: settings.time.color,
                                    fontSize: `${settings.time.fontSize}px`,
                                    fontWeight: settings.content.fontWeight,
                                    visibility: time ? 'visible' : 'hidden'
                                  }}
                                >
                                  {time || '00:00 Uhr'}
                                </span>
                                <div className="flex-1">
                                  <span 
                                    className={
                                      settings.content.fontFamily === 'league-spartan' ? 'font-league-spartan' :
                                      settings.content.fontFamily === 'montserrat' ? 'font-montserrat' :
                                      'font-sans'
                                    }
                                    style={{
                                      color: settings.event.color,
                                      fontSize: `${settings.event.fontSize}px`,
                                      fontWeight: settings.content.fontWeight
                                    }}
                                  >
                                    {formatEventTitle(event)}
                                  </span>
                                  {event.location.address && (
                                    <div 
                                      className={`${
                                        settings.content.fontFamily === 'league-spartan' ? 'font-league-spartan' :
                                        settings.content.fontFamily === 'montserrat' ? 'font-montserrat' :
                                        'font-sans'
                                      }`}
                                      style={{
                                        color: settings.location.color,
                                        fontSize: `${settings.location.fontSize}px`,
                                        fontWeight: settings.content.fontWeight
                                      }}
                                    >
                                      {formatAddress(event.location.address)}
                                    </div>
                                  )}
                                  {(event.socialMedia?.instagram || event.socialMedia?.facebook || event.socialMedia?.tiktok) && (
                                    <div 
                                      className={`flex items-center gap-2 ${
                                        settings.content.fontFamily === 'league-spartan' ? 'font-league-spartan' :
                                        settings.content.fontFamily === 'montserrat' ? 'font-montserrat' :
                                        'font-sans'
                                      }`}
                                      style={{
                                        color: settings.location.color,
                                        fontSize: `${settings.location.fontSize}px`,
                                        fontWeight: settings.content.fontWeight
                                      }}
                                    >
                                      {event.socialMedia?.instagram && (
                                        <div className="flex items-center gap-1">
                                          <svg
                                            role="img"
                                            viewBox="0 0 24 24"
                                            width={settings.location.fontSize}
                                            height={settings.location.fontSize}
                                            fill="currentColor"
                                          >
                                            <path d={siInstagram.path} />
                                          </svg>
                                          <span>{event.socialMedia.instagram}</span>
                                        </div>
                                      )}
                                      {event.socialMedia?.facebook && (
                                        <div className="flex items-center gap-1">
                                          <svg
                                            role="img"
                                            viewBox="0 0 24 24"
                                            width={settings.location.fontSize}
                                            height={settings.location.fontSize}
                                            fill="currentColor"
                                          >
                                            <path d={siFacebook.path} />
                                          </svg>
                                          <span>{event.socialMedia.facebook}</span>
                                        </div>
                                      )}
                                      {event.socialMedia?.tiktok && (
                                        <div className="flex items-center gap-1">
                                          <svg
                                            role="img"
                                            viewBox="0 0 24 24"
                                            width={settings.location.fontSize}
                                            height={settings.location.fontSize}
                                            fill="currentColor"
                                          >
                                            <path d={siTiktok.path} />
                                          </svg>
                                          <span>{event.socialMedia.tiktok}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            
              <div className="mt-4 flex justify-center items-center">
                <div 
                  className="rounded-full bg-black flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${settings.logo.size}rem`,
                    height: `${settings.logo.size}rem`
                  }}
                >
                  <img 
                    src={LogoImage} 
                    alt="nuernbergspots.com" 
                    style={{
                      width: `${settings.logo.size - 2}rem`,
                      height: `${settings.logo.size - 2}rem`,
                      opacity: settings.logo.opacity
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Als Bild herunterladen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 