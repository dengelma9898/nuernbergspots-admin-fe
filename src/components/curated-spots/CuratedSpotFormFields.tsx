import { LoadingButton } from '@/components/LoadingButton';
import { AdminRatingStars } from '@/components/curated-spots/AdminRatingStars';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { LocationSearch } from '@/components/ui/LocationSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { fadeInUp, defaultTransition } from '@/lib/animations';
import { motion } from '@/components/motion';
import { AlertCircle, ArrowLeft, ImagePlus, MapPin, Star, Trash2, Video, X } from 'lucide-react';

import {
  useCuratedSpotForm,
  chipKey,
  formatAdminRatedAt,
  isAddressComplete,
} from '@/hooks/useCuratedSpotForm';
import { CuratedSpotStatus } from '@/models/curated-spot';

export type CuratedSpotFormFieldsProps = ReturnType<typeof useCuratedSpotForm>;

export function CuratedSpotFormFields(props: CuratedSpotFormFieldsProps) {
  const {
    isEdit,
    isAdminOrSuperAdmin,
    userRole,
    loadingSpot,
    saving,
    name,
    setName,
    descriptionMarkdown,
    setDescriptionMarkdown,
    videoUrl,
    setVideoUrl,
    instagramUrl,
    setInstagramUrl,
    status,
    setStatus,
    chips,
    suggestQ,
    setSuggestQ,
    suggestions,
    suggestLoading,
    newTagInput,
    setNewTagInput,
    imageFiles,
    setImageFiles,
    videoFile,
    setVideoFile,
    existingImageUrls,
    address,
    searchValue,
    adminRatingCommitted,
    adminRatedAtCommitted,
    adminRatingDraft,
    setAdminRatingDraft,
    navigate,
    addChip,
    removeChip,
    handleAddFreeTag,
    handlePickSuggestion,
    handleLocationSelect,
    handleSubmit,
  } = props;

  if (loadingSpot && isEdit) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={defaultTransition}
            className="flex items-center gap-3"
          >
            <LoadingButton
              variant="outline"
              size="icon"
              onClick={() => navigate('/curated-spots')}
              className={cn(buttonPreset)}
              aria-label="Zurück zur Liste"
            >
              <ArrowLeft className="h-4 w-4" />
            </LoadingButton>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Spot bearbeiten' : 'Neuer kuratierter Spot'}
            </h1>
          </motion.div>

          {!isAdminOrSuperAdmin && userRole !== null && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Keine Schreibrechte</AlertTitle>
              <AlertDescription>
                Nur Admin oder Super-Admin können Spots speichern (Backend-Rollen-Guard).
              </AlertDescription>
            </Alert>
          )}

          <motion.form
            onSubmit={handleSubmit}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
            className="space-y-6"
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground">Stammdaten</CardTitle>
                <CardDescription>Name, Status und Beschreibung (Markdown).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spot-name" className="text-foreground">
                    Name *
                  </Label>
                  <Input
                    id="spot-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={200}
                    className={cn(inputPreset)}
                    disabled={!isAdminOrSuperAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Status</Label>
                  <Select
                    value={status}
                    onValueChange={v => setStatus(v as CuratedSpotStatus)}
                    disabled={!isAdminOrSuperAdmin}
                  >
                    <SelectTrigger className={cn(inputPreset)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Beschreibung (Markdown) *</Label>
                  <MarkdownEditor
                    value={descriptionMarkdown}
                    onChange={setDescriptionMarkdown}
                    minHeight="min-h-[220px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 shrink-0" />
                  Redaktionsbewertung
                </CardTitle>
                <CardDescription>
                  Einmalig vergebbar (1–5 Sterne); nach Speichern nicht mehr änderbar — siehe
                  Backend-Doku curated-spots-ratings-web-integration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEdit && adminRatingCommitted != null ? (
                  <>
                    <AdminRatingStars value={adminRatingCommitted} readOnly />
                    {formatAdminRatedAt(adminRatedAtCommitted) && (
                      <p className="text-sm text-muted-foreground">
                        Vergeben am {formatAdminRatedAt(adminRatedAtCommitted)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Die Redaktionsbewertung ist endgültig und kann nicht geändert werden.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Optional: Sterne antippen, dann mit &quot;Speichern&quot; übernehmen.
                    </p>
                    <AdminRatingStars
                      value={adminRatingDraft}
                      onChange={setAdminRatingDraft}
                      disabled={!isAdminOrSuperAdmin || saving}
                    />
                    {adminRatingDraft != null && isAdminOrSuperAdmin && !saving && (
                      <LoadingButton
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(buttonPreset)}
                        onClick={() => setAdminRatingDraft(null)}
                      >
                        Auswahl zurücksetzen
                      </LoadingButton>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 shrink-0" />
                  Adresse
                </CardTitle>
                <CardDescription>
                  Adresse wie bei Partnern über HERE suchen; Straße, Hausnummer, PLZ, Stadt und
                  Koordinaten werden automatisch übernommen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">HERE-Suche</Label>
                  <LocationSearch
                    value={searchValue}
                    onChange={handleLocationSelect}
                    placeholder="Adresse suchen…"
                    debounce={1000}
                  />
                </div>
                {isAddressComplete(address) && (
                  <div className="text-sm text-muted-foreground flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Ausgewählte Adresse: {address.street} {address.houseNumber},{' '}
                      {address.postalCode} {address.city}
                      <span className="block text-xs mt-1 opacity-80">
                        {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                      </span>
                    </span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Pflicht für Speichern — siehe Backend-Doku (Feld address).
                </p>
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground">Spot-Keywords</CardTitle>
                <CardDescription>
                  Auswahl per Vorschlag (ID) oder freier Tag-Name (wird als newKeywordNames
                  mitgeschickt).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {chips.map((c, index) => (
                    <Badge
                      key={chipKey(c, index)}
                      variant="outline"
                      className={cn(
                        'pl-2 pr-1 py-1 gap-1 font-medium border-border',
                        'bg-foreground text-background',
                        'dark:bg-background dark:text-foreground dark:border-border'
                      )}
                    >
                      {c.label}
                      <button
                        type="button"
                        className="rounded-full p-0.5 text-inherit hover:bg-background/20 dark:hover:bg-foreground/15"
                        onClick={() => removeChip(index)}
                        aria-label="Tag entfernen"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {chips.length === 0 && (
                    <span className="text-sm text-muted-foreground">Noch keine Tags.</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Vorschläge (Präfix)</Label>
                  <Input
                    value={suggestQ}
                    onChange={e => setSuggestQ(e.target.value)}
                    className={cn(inputPreset)}
                    placeholder="Mind. 1 Zeichen tippen…"
                  />
                  {suggestLoading && <Skeleton className="h-16 w-full rounded-lg" />}
                  {!suggestLoading && suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map(kw => (
                        <LoadingButton
                          key={kw.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          className={cn(buttonPreset, 'h-auto py-1')}
                          onClick={() => handlePickSuggestion(kw)}
                          disabled={!isAdminOrSuperAdmin}
                        >
                          + {kw.name}
                        </LoadingButton>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    maxLength={120}
                    className={cn(inputPreset)}
                    placeholder="Neuen Tag-Namen eingeben…"
                    disabled={!isAdminOrSuperAdmin}
                    onKeyDown={ev => {
                      if (ev.key === 'Enter') {
                        ev.preventDefault();
                        handleAddFreeTag();
                      }
                    }}
                  />
                  <LoadingButton
                    type="button"
                    variant="secondary"
                    className={cn(buttonPreset, 'shrink-0')}
                    onClick={handleAddFreeTag}
                    disabled={!isAdminOrSuperAdmin}
                  >
                    Tag hinzufügen
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground">Links & Medien</CardTitle>
                <CardDescription>
                  Optionale URLs; Uploads ersetzen/ergänzen gemäß API.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url" className="text-foreground">
                    Video-URL
                  </Label>
                  <Input
                    id="video-url"
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    className={cn(inputPreset)}
                    placeholder="https://…"
                    disabled={!isAdminOrSuperAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ig-url" className="text-foreground">
                    Instagram-URL
                  </Label>
                  <Input
                    id="ig-url"
                    type="url"
                    value={instagramUrl}
                    onChange={e => setInstagramUrl(e.target.value)}
                    className={cn(inputPreset)}
                    placeholder="https://www.instagram.com/…"
                    disabled={!isAdminOrSuperAdmin}
                  />
                </div>
                {isEdit && existingImageUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-foreground">Vorhandene Bilder</Label>
                    <ul className="text-xs font-mono text-muted-foreground space-y-1 break-all">
                      {existingImageUrls.map(url => (
                        <li key={url}>{url}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    Bilder hochladen (max. 20 pro Request)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={!isAdminOrSuperAdmin}
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      setImageFiles(files.slice(0, 20));
                    }}
                  />
                  {imageFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{imageFiles.length} Datei(en) ausgewählt</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-destructive"
                        onClick={() => setImageFiles([])}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Auswahl leeren
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video-Datei (überschreibt videoUrl laut API)
                  </Label>
                  <Input
                    type="file"
                    accept="video/*"
                    disabled={!isAdminOrSuperAdmin}
                    onChange={e => {
                      const f = e.target.files?.[0] || null;
                      setVideoFile(f);
                    }}
                  />
                  {videoFile && (
                    <span className="text-sm text-muted-foreground">{videoFile.name}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <LoadingButton
              type="submit"
              isLoading={saving}
              disabled={!isAdminOrSuperAdmin}
              className={cn(buttonPreset, 'w-full sm:w-auto')}
            >
              Speichern
            </LoadingButton>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
