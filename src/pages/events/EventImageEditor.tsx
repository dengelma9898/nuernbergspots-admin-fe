import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import { Event } from '@/models/events';
import { Download, Palette, Type, Image as ImageIcon } from 'lucide-react';
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
import { showUserFriendlyError } from '@/utils/errorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

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
    fontFamily: 'league-spartan' | 'montserrat' | 'more-sugar' | 'system-ui';
    fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    backgroundTransparent: boolean;
    showBorder: boolean;
    showContainer: boolean;
    rotation: number;
    textAlign: 'left' | 'center' | 'right';
  };
  content: {
    backgroundColor: string;
    textColor: string;
    horizontalMargin: number;
    contentStartMargin: number;
    contentPadding: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
    containerOpacity: number;
    backgroundType: 'image' | 'color';
    backgroundImageOpacity: number;
    backgroundBlendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
    eventSpacing: number;
    dateBlockSpacing: number;
  };
  date: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'more-sugar' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  event: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  time: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  location: {
    fontSize: number;
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
    fontSize: 100,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    shadowColor: '#000000',
    fontFamily: 'more-sugar',
    fontWeight: 700,
    backgroundTransparent: false,
    showBorder: false,
    showContainer: false,
    rotation: -2,
    textAlign: 'center',
  },
  content: {
    backgroundColor: '#414141',
    textColor: '#FFFFFF',
    horizontalMargin: 2,
    contentStartMargin: 3,
    contentPadding: 1,
    fontFamily: 'montserrat',
    fontWeight: 400,
    containerOpacity: 1,
    backgroundType: 'color',
    backgroundImageOpacity: 1,
    backgroundBlendMode: 'normal',
    eventSpacing: 2,
    dateBlockSpacing: 2,
  },
  date: {
    fontSize: 19,
    fontFamily: 'more-sugar',
    fontWeight: 600,
  },
  event: {
    fontSize: 19,
    fontFamily: 'montserrat',
    fontWeight: 500,
  },
  time: {
    fontSize: 19,
    fontFamily: 'montserrat',
    fontWeight: 400,
  },
  location: {
    fontSize: 19,
    fontFamily: 'montserrat',
    fontWeight: 400,
  },
  logo: {
    size: 10,
    opacity: 0.9,
  },
};

// Hilfsfunktionen für Farbkonvertierung
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
  const [customEventTexts, setCustomEventTexts] = useState<Record<string, string>>({});
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
          console.error('Fehler beim Laden des Events:', error);
          showUserFriendlyError(error, toast, () => loadEvent(), 'load-event');
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
        dateOnly: dateStr,
      };
    } catch (error) {
      console.error('Fehler beim Formatieren des Datums:', error);
      return {
        dayDate: 'Ungültiges Datum',
        time: '',
        dayOnly: '',
        dateOnly: '',
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
      events,
    }));
  };

  const handleDownload = async () => {
    if (elementRef.current) {
      try {
        // Warte kurz, damit alle Fonts geladen sind
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Hole die tatsächliche Hintergrundfarbe aus den Settings
        const backgroundColor = settings.content.backgroundType === 'color'
          ? settings.content.backgroundColor
          : 'white';

        const dataUrl = await toPng(elementRef.current, {
          quality: 1.0,
          backgroundColor: backgroundColor,
          width: 1080,
          height: 1920,
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `${categoryName.toLowerCase()}-events.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Fehler beim Generieren des Bildes:', err);
        toast.error('Fehler beim Exportieren des Bildes');
      }
    }
  };

  const updateSetting = (section: keyof DesignSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setBackgroundImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => setBackgroundImage(null);

  const groupedEvents = groupEventsByDate(events);

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
            <div className="flex flex-row items-center gap-4">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/events')}
                className={cn(glassButton, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zur Übersicht</span>
              </AnimatedButton>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Event-Bild Editor
              </h1>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 lg:items-start">
          {/* Linke Spalte - Einstellungen */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
            <Card className={cn(glassCard)}>
              <CardHeader>
                <CardTitle className="text-foreground">Design-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="title">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="title">
                      <Type className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Titel</span>
                    </TabsTrigger>
                    <TabsTrigger value="content">
                      <Palette className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Inhalt</span>
                    </TabsTrigger>
                    <TabsTrigger value="logo">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Logo</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="title" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-title" className="text-foreground">
                        Titel Text
                      </Label>
                      <Textarea
                        id="custom-title"
                        value={customTitle}
                        onChange={e => {
                          const newValue = e.target.value;
                          console.log('Neuer Titel:', newValue);
                          setCustomTitle(newValue);
                        }}
                        placeholder="Titel eingeben..."
                        className={cn(glassInput, 'font-mono min-h-[100px] resize-y')}
                      />
                      <p className="text-sm text-white/70">
                        Leer lassen, um den Kategorienamen zu verwenden
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Schriftgröße</Label>
                      <Slider
                        value={[settings.title.fontSize]}
                        onValueChange={([value]) => updateSetting('title', 'fontSize', value)}
                        min={50}
                        max={200}
                        step={1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">{settings.title.fontSize}px</div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Textfarbe</Label>
                      <ColorPicker
                        value={settings.title.color}
                        onChange={value => updateSetting('title', 'color', value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Textfarbe des Titels
                      </p>
                      <div
                        className="h-12 rounded-lg border-2 border-foreground flex items-center justify-center"
                        style={{
                          backgroundColor: settings.title.color,
                        }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{
                            color:
                              settings.title.color === '#000000' ||
                              settings.title.color === '#FFFFFF' ||
                              parseInt(settings.title.color.slice(1, 3), 16) +
                                parseInt(settings.title.color.slice(3, 5), 16) +
                                parseInt(settings.title.color.slice(5, 7), 16) <
                                400
                                ? '#FFFFFF'
                                : '#000000',
                          }}
                        >
                          Beispieltext
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Hintergrundfarbe</Label>
                      <ColorPicker
                        value={settings.title.backgroundColor}
                        onChange={value => updateSetting('title', 'backgroundColor', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Rahmenfarbe</Label>
                      <ColorPicker
                        value={settings.title.borderColor}
                        onChange={value => updateSetting('title', 'borderColor', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Schattenfarbe</Label>
                      <ColorPicker
                        value={settings.title.shadowColor}
                        onChange={value => updateSetting('title', 'shadowColor', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Schriftart</Label>
                      <Select
                        value={settings.title.fontFamily}
                        onValueChange={value => updateSetting('title', 'fontFamily', value)}
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Schriftart wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="more-sugar"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            More Sugar
                          </SelectItem>
                          <SelectItem
                            value="league-spartan"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            League Spartan
                          </SelectItem>
                          <SelectItem
                            value="montserrat"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Montserrat
                          </SelectItem>
                          <SelectItem
                            value="system-ui"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            System
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Schriftschnitt</Label>
                      <Select
                        value={settings.title.fontWeight.toString()}
                        onValueChange={value =>
                          updateSetting('title', 'fontWeight', parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Schriftschnitt wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem value="100" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            100
                          </SelectItem>
                          <SelectItem value="200" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            200
                          </SelectItem>
                          <SelectItem value="300" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            300
                          </SelectItem>
                          <SelectItem value="400" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            400
                          </SelectItem>
                          <SelectItem value="500" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            500
                          </SelectItem>
                          <SelectItem value="600" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            600
                          </SelectItem>
                          <SelectItem value="700" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            700
                          </SelectItem>
                          <SelectItem value="800" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            800
                          </SelectItem>
                          <SelectItem value="900" className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent">
                            900
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
                      <Label className="text-foreground font-medium cursor-pointer dark:text-foreground">
                        Hintergrund transparent
                      </Label>
                      <input
                        type="checkbox"
                        checked={settings.title.backgroundTransparent}
                        onChange={e =>
                          updateSetting('title', 'backgroundTransparent', e.target.checked)
                        }
                        className="ml-auto accent-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
                      <Label className="text-foreground font-medium cursor-pointer dark:text-foreground">
                        Rahmen anzeigen
                      </Label>
                      <input
                        type="checkbox"
                        checked={settings.title.showBorder}
                        onChange={e => updateSetting('title', 'showBorder', e.target.checked)}
                        className="ml-auto accent-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
                      <Label className="text-foreground font-medium cursor-pointer dark:text-foreground">
                        Container anzeigen
                      </Label>
                      <input
                        type="checkbox"
                        checked={settings.title.showContainer}
                        onChange={e =>
                          updateSetting('title', 'showContainer', e.target.checked)
                        }
                        className="ml-auto accent-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Ausrichtung (Rotation)</Label>
                      <Slider
                        value={[settings.title.rotation]}
                        onValueChange={([value]) => updateSetting('title', 'rotation', value)}
                        min={-45}
                        max={45}
                        step={1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">
                        {settings.title.rotation}°
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Textausrichtung</Label>
                      <Select
                        value={settings.title.textAlign}
                        onValueChange={value =>
                          updateSetting('title', 'textAlign', value as 'left' | 'center' | 'right')
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Textausrichtung wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="left"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Links
                          </SelectItem>
                          <SelectItem
                            value="center"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Zentriert
                          </SelectItem>
                          <SelectItem
                            value="right"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Rechts
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    {settings.content.backgroundType === 'color' && (
                      <div className="space-y-2">
                        <Label className="text-foreground">Hintergrundfarbe</Label>
                        <ColorPicker
                          value={settings.content.backgroundColor}
                          onChange={value => {
                            updateSetting('content', 'backgroundColor', value);
                          }}
                        />
                        <p className="text-sm text-white/70">Vollfächiger Hintergrund</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-foreground">Inhaltsfarbe</Label>
                      <ColorPicker
                        value={settings.content.backgroundColor}
                        onChange={value => {
                          updateSetting('content', 'backgroundColor', value);
                        }}
                      />
                      <p className="text-sm text-muted-foreground">
                        Hintergrundfarbe des Event-Containers
                      </p>
                      <div
                        className="h-12 rounded-lg border-2 border-foreground"
                        style={{
                          backgroundColor: settings.content.backgroundColor,
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Textfarbe des Inhalts</Label>
                      <ColorPicker
                        value={settings.content.textColor}
                        onChange={value => {
                          updateSetting('content', 'textColor', value);
                        }}
                      />
                      <p className="text-sm text-muted-foreground">
                        Textfarbe für alle Event-Texte
                      </p>
                      <div
                        className="h-12 rounded-lg border-2 border-foreground flex items-center justify-center"
                        style={{
                          backgroundColor: settings.content.textColor,
                        }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{
                            color:
                              settings.content.textColor === '#000000' ||
                              settings.content.textColor === '#FFFFFF' ||
                              parseInt(settings.content.textColor.slice(1, 3), 16) +
                                parseInt(settings.content.textColor.slice(3, 5), 16) +
                                parseInt(settings.content.textColor.slice(5, 7), 16) <
                                400
                                ? '#FFFFFF'
                                : '#000000',
                          }}
                        >
                          Beispieltext
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Container Transparenz</Label>
                      <Slider
                        value={[Math.round(settings.content.containerOpacity * 100)]}
                        onValueChange={([value]) => {
                          updateSetting('content', 'containerOpacity', value / 100);
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">
                        {Math.round(settings.content.containerOpacity * 100)}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Horizontaler Abstand</Label>
                      <Slider
                        value={[settings.content.horizontalMargin]}
                        onValueChange={([value]) => updateSetting('content', 'horizontalMargin', value)}
                        min={0.5}
                        max={5}
                        step={0.1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <p className="text-sm text-muted-foreground">
                        Abstand links und rechts vom Rand des Bildes
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Content-Start-Abstand</Label>
                      <Slider
                        value={[settings.content.contentStartMargin]}
                        onValueChange={([value]) => updateSetting('content', 'contentStartMargin', value)}
                        min={3}
                        max={8}
                        step={0.1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <p className="text-sm text-muted-foreground">
                        Horizontaler Abstand des Contents zum Container-Rand
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Content-Padding</Label>
                      <Slider
                        value={[settings.content.contentPadding]}
                        onValueChange={([value]) => updateSetting('content', 'contentPadding', value)}
                        min={0}
                        max={3}
                        step={0.1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <p className="text-sm text-muted-foreground">
                        Innenabstand des Event-Containers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Textgröße</Label>
                      <Slider
                        value={[settings.event.fontSize]}
                        onValueChange={([value]) => {
                          updateSetting('event', 'fontSize', value);
                          updateSetting('date', 'fontSize', value);
                          updateSetting('time', 'fontSize', value);
                          updateSetting('location', 'fontSize', value);
                        }}
                        min={10}
                        max={24}
                        step={1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">{settings.event.fontSize}px</div>
                      <p className="text-sm text-muted-foreground">
                        Gilt für alle Texte (Datum, Event, Uhrzeit, Ort)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Datum Schriftart</Label>
                      <Select
                        value={settings.date.fontFamily}
                        onValueChange={value =>
                          updateSetting('date', 'fontFamily', value as 'league-spartan' | 'montserrat' | 'more-sugar' | 'system-ui')
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Schriftart wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="more-sugar"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            More Sugar
                          </SelectItem>
                          <SelectItem
                            value="league-spartan"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            League Spartan
                          </SelectItem>
                          <SelectItem
                            value="montserrat"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Montserrat
                          </SelectItem>
                          <SelectItem
                            value="system-ui"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            System UI
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Datum Schriftstärke</Label>
                      <Select
                        value={settings.date.fontWeight.toString()}
                        onValueChange={value =>
                          updateSetting('date', 'fontWeight', parseInt(value) as 400 | 500 | 600 | 700)
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Schriftstärke wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="400"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Normal (400)
                          </SelectItem>
                          <SelectItem
                            value="500"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Medium (500)
                          </SelectItem>
                          <SelectItem
                            value="600"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Semi-Bold (600)
                          </SelectItem>
                          <SelectItem
                            value="700"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Bold (700)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 bg-background border-2 border-foreground rounded-xl p-3 dark:bg-card dark:border-foreground">
                      <Label className="text-foreground text-lg font-semibold">Event-Texte</Label>
                    </div>

                    {groupedEvents.map((group, groupIndex) => (
                      <div key={groupIndex} className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-foreground font-semibold">
                            {formatDate(group.date.toISOString()).dayDate}
                          </Label>
                          {group.events.map(event => {
                            const time = event.dailyTimeSlots?.[0]?.from
                              ? `${event.dailyTimeSlots[0].from} Uhr`
                              : '';
                            const eventTitle = formatEventTitle(event);
                            const location = event.location.address
                              ? formatAddress(event.location.address)
                              : '';
                            const parts: string[] = [];
                            if (time) parts.push(time);
                            if (eventTitle) parts.push(eventTitle);
                            if (location) parts.push(location);
                            const defaultText = parts.join(' | ');

                            return (
                              <div key={event.id} className="space-y-1">
                                <Label htmlFor={`event-${event.id}`} className="text-foreground text-sm">
                                  {eventTitle || 'Event'}
                                </Label>
                                <Input
                                  id={`event-${event.id}`}
                                  value={customEventTexts[event.id] ?? defaultText}
                                  onChange={e => {
                                    setCustomEventTexts(prev => ({
                                      ...prev,
                                      [event.id]: e.target.value,
                                    }));
                                  }}
                                  placeholder={defaultText}
                                  className={cn(glassInput, 'font-mono text-sm')}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label className="text-foreground">Event Schriftart</Label>
                      <Select
                        value={settings.event.fontFamily}
                        onValueChange={value =>
                          updateSetting('event', 'fontFamily', value as 'league-spartan' | 'montserrat' | 'system-ui')
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Schriftart wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="montserrat"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Montserrat
                          </SelectItem>
                          <SelectItem
                            value="league-spartan"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            League Spartan
                          </SelectItem>
                          <SelectItem
                            value="system-ui"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            System UI
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Event Schriftstärke</Label>
                      <Select
                        value={settings.event.fontWeight.toString()}
                        onValueChange={value =>
                          updateSetting('event', 'fontWeight', parseInt(value) as 400 | 500 | 600 | 700)
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Schriftstärke wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="400"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Normal (400)
                          </SelectItem>
                          <SelectItem
                            value="500"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Medium (500)
                          </SelectItem>
                          <SelectItem
                            value="600"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Semi-Bold (600)
                          </SelectItem>
                          <SelectItem
                            value="700"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Bold (700)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Abstand zwischen Datumsblöcken</Label>
                      <Slider
                        value={[settings.content.dateBlockSpacing]}
                        onValueChange={([value]) => updateSetting('content', 'dateBlockSpacing', value)}
                        min={0}
                        max={8}
                        step={0.5}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">
                        {settings.content.dateBlockSpacing}rem
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Abstand zwischen verschiedenen Tagen
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Abstand zwischen Events</Label>
                      <Slider
                        value={[settings.content.eventSpacing]}
                        onValueChange={([value]) => updateSetting('content', 'eventSpacing', value)}
                        min={0}
                        max={8}
                        step={0.5}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">
                        {settings.content.eventSpacing}rem
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Abstand zwischen Events desselben Tages
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Hintergrund-Typ</Label>
                      <Select
                        value={settings.content.backgroundType}
                        onValueChange={value =>
                          updateSetting('content', 'backgroundType', value as 'image' | 'color')
                        }
                      >
                        <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                          <SelectValue placeholder="Hintergrund-Typ wählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="color"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Vollfarbe
                          </SelectItem>
                          <SelectItem
                            value="image"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Hintergrundbild
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings.content.backgroundType === 'image' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground">Hintergrundbild</Label>
                            <Input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundImageChange}
                            className="bg-background border-2 border-foreground text-foreground file:text-foreground file:bg-accent file:border-foreground file:font-semibold hover:bg-accent hover:border-foreground/80 focus:bg-accent focus:border-foreground/80 transition-all duration-300 rounded-xl dark:bg-card dark:border-foreground dark:text-foreground dark:file:text-foreground dark:file:bg-accent"
                          />
                          {backgroundImage && (
                            <div className={cn(glassCard, 'mt-2 flex items-center gap-4 p-3')}>
                              <img
                                src={backgroundImage}
                                alt="Vorschau"
                                className="h-16 rounded shadow"
                              />
                              <AnimatedButton
                                variant="outline"
                                onClick={removeBackgroundImage}
                                className={cn(
                                  glassButton,
                                  'border-2 border-foreground bg-background text-foreground hover:bg-accent hover:border-foreground/80 font-semibold dark:bg-card dark:border-foreground dark:text-foreground'
                                )}
                              >
                                Entfernen
                              </AnimatedButton>
                            </div>
                          )}
                        </div>

                        {backgroundImage && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-foreground">Bild-Transparenz</Label>
                              <Slider
                                value={[Math.round(settings.content.backgroundImageOpacity * 100)]}
                                onValueChange={([value]) => {
                                  updateSetting('content', 'backgroundImageOpacity', value / 100);
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className={cn(glassCard, 'p-2')}
                              />
                              <div className="text-sm text-muted-foreground">
                                {Math.round(settings.content.backgroundImageOpacity * 100)}%
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-foreground">Blend-Mode</Label>
                              <Select
                                value={settings.content.backgroundBlendMode}
                                onValueChange={value =>
                                  updateSetting(
                                    'content',
                                    'backgroundBlendMode',
                                    value as 'normal' | 'multiply' | 'overlay' | 'screen'
                                  )
                                }
                              >
                                <SelectTrigger className="bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 rounded-xl font-medium dark:bg-card dark:border-foreground dark:text-foreground">
                                  <SelectValue placeholder="Blend-Mode wählen" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-2 border-foreground text-popover-foreground dark:bg-popover dark:border-foreground dark:text-popover-foreground">
                          <SelectItem
                            value="normal"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Normal
                          </SelectItem>
                          <SelectItem
                            value="multiply"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Multiply
                          </SelectItem>
                          <SelectItem
                            value="overlay"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Overlay
                          </SelectItem>
                          <SelectItem
                            value="screen"
                            className="text-popover-foreground hover:bg-accent focus:bg-accent dark:text-popover-foreground dark:hover:bg-accent dark:focus:bg-accent"
                          >
                            Screen
                          </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="logo" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Logo-Größe</Label>
                      <Slider
                        value={[settings.logo.size]}
                        onValueChange={([value]) => updateSetting('logo', 'size', value)}
                        min={1}
                        max={15}
                        step={1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">{settings.logo.size}rem</div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Transparenz</Label>
                      <Slider
                        value={[settings.logo.opacity * 100]}
                        onValueChange={([value]) => updateSetting('logo', 'opacity', value / 100)}
                        min={0}
                        max={100}
                        step={1}
                        className={cn(glassCard, 'p-2')}
                      />
                      <div className="text-sm text-muted-foreground">
                        {Math.round(settings.logo.opacity * 100)}%
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Rechte Spalte - Vorschau */}
          <motion.div
            className="lg:col-span-2 lg:sticky lg:top-6 self-start"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(glassCard, 'p-6 mb-6')}>
              <div className="mb-4 p-3 bg-background border-2 border-foreground rounded-xl dark:bg-card dark:border-foreground">
                <p className="text-sm text-foreground">
                  <strong>Export-Format:</strong> 1080 × 1920 px
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Die Vorschau wird skaliert angezeigt, damit der gesamte Content sichtbar ist.
                </p>
              </div>
              <div className="overflow-auto max-h-[calc(100vh-300px)] flex justify-center items-start p-4">
                <div
                  style={{
                    transform: 'scale(0.4)',
                    transformOrigin: 'top center',
                  }}
                >
                  <div
                    ref={elementRef}
                    className="rounded-xl shadow-lg relative overflow-hidden"
                    style={{
                      width: '1080px',
                      minHeight: '1920px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      backgroundColor:
                        settings.content.backgroundType === 'color'
                          ? settings.content.backgroundColor
                          : 'white',
                      marginLeft: `${settings.content.horizontalMargin}rem`,
                      marginRight: `${settings.content.horizontalMargin}rem`,
                      paddingTop: '2rem',
                      paddingBottom: '2rem',
                    }}
                  >
                {settings.content.backgroundType === 'image' && backgroundImage && (
                  <>
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: settings.content.backgroundImageOpacity,
                        mixBlendMode: settings.content.backgroundBlendMode,
                      }}
                    />
                  </>
                )}
                <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(1920px - 4rem)', paddingLeft: `${settings.content.contentStartMargin}rem`, paddingRight: `${settings.content.contentStartMargin}rem` }}>
                  {/* Titel oben - nicht absolut positioniert */}
                  <div
                    className="w-full mb-4"
                    style={{
                      textAlign: settings.title.textAlign,
                    }}
                  >
                    <h1
                      className={`text-2xl sm:text-4xl font-black tracking-tight inline-block whitespace-pre-line ${
                        settings.title.fontFamily === 'league-spartan'
                          ? 'font-league-spartan'
                          : settings.title.fontFamily === 'montserrat'
                            ? 'font-montserrat'
                            : settings.title.fontFamily === 'more-sugar'
                              ? 'font-more-sugar'
                              : 'font-sans'
                      }`}
                      style={{
                        color: settings.title.color,
                        fontSize: `${settings.title.fontSize}px`,
                        backgroundColor: settings.title.backgroundTransparent
                          ? 'transparent'
                          : settings.title.showContainer
                            ? settings.title.backgroundColor
                            : 'transparent',
                        borderRadius: '4px',
                        WebkitTextStroke: '2px white',
                        textShadow: '2px 2px 6px rgba(0,0,0,0.3)',
                        border: settings.title.showBorder
                          ? `2px solid ${settings.title.borderColor}`
                          : 'none',
                        padding: settings.title.showContainer ? '0.5rem 1rem' : '0',
                        fontWeight: settings.title.fontWeight,
                        transform: `rotate(${settings.title.rotation}deg)`,
                      }}
                    >
                      {customTitle || categoryName}
                    </h1>
                  </div>

                  <div
                    className="rounded-lg overflow-hidden flex-1"
                    style={{
                      backgroundColor: hexToRgba(
                        settings.content.backgroundColor,
                        settings.content.containerOpacity
                      ),
                      padding: `${settings.content.contentPadding}rem`,
                      paddingBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `${settings.content.dateBlockSpacing}rem`,
                    }}
                  >
                    {groupedEvents.map((group, groupIndex) => {
                      const { dayDate } = formatDate(group.date.toISOString());
                      return (
                        <div key={groupIndex}>
                          <div
                            className={
                              settings.date.fontFamily === 'more-sugar'
                                ? 'font-more-sugar'
                                : settings.date.fontFamily === 'league-spartan'
                                  ? 'font-league-spartan'
                                  : settings.date.fontFamily === 'montserrat'
                                    ? 'font-montserrat'
                                    : 'font-sans'
                            }
                            style={{
                              color: settings.content.textColor,
                              fontSize: `${settings.date.fontSize}px`,
                              fontWeight: settings.date.fontWeight,
                            }}
                          >
                            {dayDate}
                          </div>
                          <div
                            style={{
                              marginTop: 0,
                              gap: `${settings.content.eventSpacing}rem`,
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            {group.events.map(event => {
                              const time = event.dailyTimeSlots?.[0]?.from
                                ? `${event.dailyTimeSlots[0].from} Uhr`
                                : '';
                              const eventTitle = formatEventTitle(event);
                              const location = event.location.address
                                ? formatAddress(event.location.address)
                                : '';
                              const parts: string[] = [];
                              if (time) parts.push(time);
                              if (eventTitle) parts.push(eventTitle);
                              if (location) parts.push(location);
                              const defaultText = parts.join(' | ');
                              const displayText = customEventTexts[event.id] ?? defaultText;

                              return (
                                <div
                                  key={event.id}
                                  className={
                                    settings.event.fontFamily === 'league-spartan'
                                      ? 'font-league-spartan'
                                      : settings.event.fontFamily === 'montserrat'
                                        ? 'font-montserrat'
                                        : 'font-sans'
                                  }
                                  style={{
                                    color: settings.content.textColor,
                                    fontSize: `${settings.event.fontSize}px`,
                                    fontWeight: settings.event.fontWeight,
                                  }}
                                >
                                  {displayText}
                                  {(event.socialMedia?.instagram ||
                                    event.socialMedia?.facebook ||
                                    event.socialMedia?.tiktok) && (
                                    <div
                                      className={`flex items-center gap-2 mt-1 ${
                                        settings.event.fontFamily === 'league-spartan'
                                          ? 'font-league-spartan'
                                          : settings.event.fontFamily === 'montserrat'
                                            ? 'font-montserrat'
                                            : 'font-sans'
                                      }`}
                                      style={{
                                        color: settings.content.textColor,
                                        fontSize: `${settings.event.fontSize}px`,
                                        fontWeight: settings.event.fontWeight,
                                      }}
                                    >
                                      {event.socialMedia?.instagram && (
                                        <div className="flex items-center gap-1">
                                          <svg
                                            role="img"
                                            viewBox="0 0 24 24"
                                            width={settings.event.fontSize}
                                            height={settings.event.fontSize}
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
                                            width={settings.event.fontSize}
                                            height={settings.event.fontSize}
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
                                            width={settings.event.fontSize}
                                            height={settings.event.fontSize}
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
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center items-center" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div
                      className="rounded-full bg-black flex items-center justify-center overflow-hidden"
                      style={{
                        width: `${settings.logo.size}rem`,
                        height: `${settings.logo.size}rem`,
                      }}
                    >
                      <img
                        src={LogoImage}
                        alt="nuernbergspots.com"
                      />
                    </div>
                  </div>
                </div>
                </div>
              </div>
              </div>
            </Card>

            <div className="flex justify-center">
              <AnimatedButton
                onClick={handleDownload}
                className={cn(
                  glassCard,
                  'bg-background border-2 border-foreground text-foreground hover:bg-accent hover:border-foreground/80 gap-2 dark:bg-card dark:border-foreground dark:text-foreground'
                )}
              >
                <Download className="h-4 w-4" />
                Als Bild herunterladen
              </AnimatedButton>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
