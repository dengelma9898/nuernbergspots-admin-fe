import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateAdventCalendarEntryDto, UpdateAdventCalendarEntryDto } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image as ImageIcon, Upload, X, Link as LinkIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

function AdventCalendarFormSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
            <CardHeader>
              <Skeleton className="h-10 w-44 rounded-xl bg-white/10 backdrop-blur-xl mb-2" />
              <Skeleton className="h-6 w-64 bg-white/10 backdrop-blur-xl rounded" />
            </CardHeader>
          </Card>

          {/* Form Skeleton */}
          <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-10 w-full bg-white/10 backdrop-blur-xl rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-32 w-full bg-white/10 backdrop-blur-xl rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                <Skeleton className="h-48 w-full bg-white/10 backdrop-blur-xl rounded-lg" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 bg-white/10 backdrop-blur-xl rounded-xl" />
                <Skeleton className="h-10 w-32 bg-white/10 backdrop-blur-xl rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdventCalendarForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adventCalendarService = useAdventCalendarService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<CreateAdventCalendarEntryDto>({
    number: 1,
    canParticipate: true,
    isActive: true,
    date: new Date().toISOString().split('T')[0], // Heute als Standard
    isSpecial: false,
    description: '',
    linkUrl: undefined,
  });

  const loadEntry = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const entry = await adventCalendarService.getById(id);
      setFormData({
        number: entry.number,
        canParticipate: entry.canParticipate,
        isActive: entry.isActive,
        date: entry.date,
        isSpecial: entry.isSpecial,
        description: entry.description,
        linkUrl: entry.linkUrl,
      });
      if (entry.imageUrl) {
        setImagePreview(entry.imageUrl);
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Eintrags', {
        description: 'Der Eintrag konnte nicht geladen werden.',
      });
      navigate('/advent-calendar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview('');
  };

  const normalizeUrl = (urlString: string): string => {
    if (!urlString || !urlString.trim()) {
      return '';
    }
    
    const trimmed = urlString.trim();
    
    // Wenn bereits ein Protokoll vorhanden ist, zurückgeben
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Wenn kein Protokoll vorhanden ist, https:// hinzufügen
    return `https://${trimmed}`;
  };

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || !urlString.trim()) {
      return true; // Leer ist erlaubt (optional)
    }
    
    try {
      const normalized = normalizeUrl(urlString);
      const url = new URL(normalized);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    if (!formData.description.trim()) {
      toast.error('Bitte geben Sie eine Beschreibung ein');
      return;
    }

    if (formData.number < 1) {
      toast.error('Das Adventstürchen muss mindestens 1 sein');
      return;
    }

    if (formData.linkUrl && formData.linkUrl.trim() && !isValidUrl(formData.linkUrl)) {
      toast.error('Bitte geben Sie eine gültige URL ein');
      return;
    }

    try {
      setIsSaving(true);
      let entryId: string;

      if (id) {
        // Update
        const updateData: UpdateAdventCalendarEntryDto = {
          number: formData.number,
          canParticipate: formData.canParticipate,
          isActive: formData.isActive,
          date: formData.date,
          isSpecial: formData.isSpecial,
          description: formData.description,
          linkUrl: formData.linkUrl?.trim() ? normalizeUrl(formData.linkUrl.trim()) : undefined,
        };
        const updatedEntry = await adventCalendarService.update(id, updateData);
        entryId = updatedEntry.id;

        // Upload Image if selected
        if (selectedImage) {
          setIsUploadingImage(true);
          await adventCalendarService.uploadImage(entryId, selectedImage);
        }

        toast.success('Eintrag aktualisiert', {
          description: 'Der Adventskalender-Eintrag wurde erfolgreich aktualisiert.',
        });
      } else {
        // Create
        const createData: CreateAdventCalendarEntryDto = {
          ...formData,
          linkUrl: formData.linkUrl?.trim() ? normalizeUrl(formData.linkUrl.trim()) : undefined,
        };
        const newEntry = await adventCalendarService.create(createData);
        entryId = newEntry.id;

        // Upload Image if selected
        if (selectedImage) {
          setIsUploadingImage(true);
          await adventCalendarService.uploadImage(entryId, selectedImage);
        }

        toast.success('Eintrag erstellt', {
          description: 'Der Adventskalender-Eintrag wurde erfolgreich erstellt.',
        });
      }

      navigate('/advent-calendar');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'}`, {
        description: 'Der Eintrag konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.',
      });
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return <AdventCalendarFormSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/advent-calendar')}
                  className="w-full sm:w-auto backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                  {id ? 'Adventskalender-Eintrag bearbeiten' : 'Neuen Adventskalender-Eintrag erstellen'}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Number */}
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-white/90">
                    Adventstürchen *
                  </Label>
                  <Input
                    id="number"
                    type="number"
                    min="1"
                    max="999"
                    value={formData.number}
                    onChange={e => {
                      const value = parseInt(e.target.value) || 1;
                      setFormData(prev => ({ ...prev, number: value }));
                    }}
                    placeholder="Nummer für Sortierung"
                    className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white rounded-lg"
                    required
                  />
                  <p className="text-xs text-white/60">
                    Diese Nummer wird für die Sortierung der Einträge verwendet.
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white/90">
                    Datum *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white rounded-lg"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/90">
                    Beschreibung *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschreibung des Adventskalender-Eintrags"
                    className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white rounded-lg min-h-[120px]"
                    required
                  />
                </div>

                {/* Link URL */}
                <div className="space-y-2">
                  <Label htmlFor="linkUrl" className="text-white/90">
                    Link URL (optional)
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input
                      id="linkUrl"
                      type="text"
                      value={formData.linkUrl || ''}
                      onChange={e => setFormData(prev => ({ ...prev, linkUrl: e.target.value || undefined }))}
                      placeholder="www.example.com oder https://example.com"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white rounded-lg pl-10"
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    Optional: URL zu einem externen Link für diesen Eintrag. Protokoll (https://) wird automatisch hinzugefügt, falls nicht vorhanden.
                  </p>
                </div>

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 backdrop-blur-2xl bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="canParticipate" className="text-white/90">
                        Teilnahme möglich
                      </Label>
                      <p className="text-xs text-white/60">
                        Benutzer können an diesem Tag teilnehmen
                      </p>
                    </div>
                    <Switch
                      id="canParticipate"
                      checked={formData.canParticipate}
                      onCheckedChange={checked =>
                        setFormData(prev => ({ ...prev, canParticipate: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 backdrop-blur-2xl bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive" className="text-white/90">
                        Aktiv
                      </Label>
                      <p className="text-xs text-white/60">
                        Eintrag ist aktiv und wird angezeigt
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={checked =>
                        setFormData(prev => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 backdrop-blur-2xl bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="isSpecial" className="text-white/90">
                        Spezieller Eintrag
                      </Label>
                      <p className="text-xs text-white/60">
                        Markiert diesen Eintrag als besonders
                      </p>
                    </div>
                    <Switch
                      id="isSpecial"
                      checked={formData.isSpecial}
                      onCheckedChange={checked =>
                        setFormData(prev => ({ ...prev, isSpecial: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-white/90">Bild</Label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border-2 border-white/20">
                          <img
                            src={imagePreview}
                            alt="Vorschau"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={removeImage}
                            className="absolute top-2 right-2 backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center backdrop-blur-2xl bg-white/5">
                        <ImageIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/70 mb-4">Kein Bild ausgewählt</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          asChild
                          className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
                        >
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Bild auswählen
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving || isUploadingImage}
                    className="flex-1 backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                  >
                    {isSaving || isUploadingImage
                      ? 'Wird gespeichert...'
                      : id
                        ? 'Eintrag aktualisieren'
                        : 'Eintrag erstellen'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/advent-calendar')}
                    className="flex-1 backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
                  >
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}

