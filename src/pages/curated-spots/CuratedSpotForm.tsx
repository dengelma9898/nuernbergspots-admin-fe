import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { LoadingButton } from '@/components/LoadingButton';
import { AdminRatingStars } from '@/components/curated-spots/AdminRatingStars';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { LocationSearch, LocationResult } from '@/components/ui/LocationSearch';
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
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useCuratedSpotService } from '@/services/curatedSpotService';
import { useSpotKeywordService } from '@/services/spotKeywordService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { BusinessAddress } from '@/models/business-address';
import { CuratedSpotStatus, PatchCuratedSpotDto } from '@/models/curated-spot';
import { SpotKeyword } from '@/models/spot-keyword';
import { UserType } from '@/models/users';

import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

import { motion } from '@/components/motion';
import { AlertCircle, ArrowLeft, ImagePlus, MapPin, Star, Trash2, Video, X } from 'lucide-react';

type Chip = { kind: 'id'; id: string; label: string } | { kind: 'new'; label: string };

function chipKey(c: Chip, index: number): string {
  return c.kind === 'id' ? `id:${c.id}` : `new:${c.label}:${index}`;
}

function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function emptyAddress(): BusinessAddress {
  return { street: '', houseNumber: '', postalCode: '', city: '', latitude: 0, longitude: 0 };
}

/** HERE-/Partner-kompatibles LocationResult für LocationSearch (vgl. EditBusiness). */
function addressToLocationResult(addr: BusinessAddress): LocationResult | null {
  const street = addr.street.trim();
  const city = addr.city.trim();
  if (!street && !city) return null;
  return {
    id: `${addr.latitude}-${addr.longitude}`,
    title: `${addr.street} ${addr.houseNumber}`.trim(),
    resultType: 'address',
    position: { lat: addr.latitude, lng: addr.longitude },
    address: {
      label: `${addr.street} ${addr.houseNumber}, ${addr.postalCode} ${addr.city}`.trim(),
      countryCode: 'DE',
      countryName: 'Deutschland',
      stateCode: 'BY',
      state: 'Bayern',
      county: '',
      city: addr.city,
      district: '',
      street: addr.street,
      postalCode: addr.postalCode,
      houseNumber: addr.houseNumber,
    },
  };
}

function isAddressComplete(a: BusinessAddress): boolean {
  return (
    a.street.trim().length > 0 &&
    a.houseNumber.trim().length > 0 &&
    a.postalCode.trim().length > 0 &&
    a.city.trim().length > 0 &&
    !(a.latitude === 0 && a.longitude === 0)
  );
}

function formatAdminRatedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CuratedSpotForm() {
  const { id: spotId } = useParams<{ id: string }>();
  const isEdit = Boolean(spotId);
  const navigate = useNavigate();

  const curatedSpotService = useCuratedSpotService();
  const curatedSpotServiceRef = useRef(curatedSpotService);
  useEffect(() => {
    curatedSpotServiceRef.current = curatedSpotService;
  }, [curatedSpotService]);

  const spotKeywordService = useSpotKeywordService();
  const spotKeywordServiceRef = useRef(spotKeywordService);
  useEffect(() => {
    spotKeywordServiceRef.current = spotKeywordService;
  }, [spotKeywordService]);

  const userService = useUserService();
  const userServiceRef = useRef(userService);
  useEffect(() => {
    userServiceRef.current = userService;
  }, [userService]);

  const { getUserId } = useAuth();

  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [loadingSpot, setLoadingSpot] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [status, setStatus] = useState<CuratedSpotStatus>('PENDING');

  const [chips, setChips] = useState<Chip[]>([]);
  const [suggestQ, setSuggestQ] = useState('');
  const [debouncedSuggestQ, setDebouncedSuggestQ] = useState('');
  const [suggestions, setSuggestions] = useState<SpotKeyword[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const [newTagInput, setNewTagInput] = useState('');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const [address, setAddress] = useState<BusinessAddress>(() => emptyAddress());
  const [searchValue, setSearchValue] = useState<LocationResult | null>(null);

  /** Nach dem Laden aus GET admin; null = noch nicht vergeben (Bearbeiten). */
  const [adminRatingCommitted, setAdminRatingCommitted] = useState<number | null>(null);
  const [adminRatedAtCommitted, setAdminRatedAtCommitted] = useState<string | null>(null);
  /** Auswahl vor dem ersten Speichern (Neuanlage oder noch ohne committed Rating). */
  const [adminRatingDraft, setAdminRatingDraft] = useState<number | null>(null);

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadUserRole = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const profile = await userServiceRef.current.getUserProfile(userId);
      setUserRole(profile.userType);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  }, [getUserId]);

  const loadSpot = useCallback(async () => {
    if (!spotId) return;
    try {
      setLoadingSpot(true);
      const spot = await curatedSpotServiceRef.current.getAdmin(spotId);
      setName(spot.name);
      setDescriptionMarkdown(spot.descriptionMarkdown);
      setVideoUrl(spot.videoUrl || '');
      setInstagramUrl(spot.instagramUrl || '');
      setStatus(spot.status);
      setExistingImageUrls(spot.imageUrls || []);

      const rawAddr = spot.address;
      const normalized: BusinessAddress = {
        street: rawAddr?.street ?? '',
        houseNumber: rawAddr?.houseNumber ?? '',
        postalCode: rawAddr?.postalCode ?? '',
        city: rawAddr?.city ?? '',
        latitude: rawAddr?.latitude ?? 0,
        longitude: rawAddr?.longitude ?? 0,
      };
      setAddress(normalized);
      setSearchValue(addressToLocationResult(normalized));

      const ids = [...new Set(spot.keywordIds || [])];
      const resolvedChips: Chip[] = await Promise.all(
        ids.map(async (kid): Promise<Chip> => {
          try {
            const kw = await spotKeywordServiceRef.current.getById(kid);
            return { kind: 'id' as const, id: kid, label: kw.name };
          } catch {
            return { kind: 'id' as const, id: kid, label: 'Unbekannt' };
          }
        })
      );
      setChips(resolvedChips);

      const ar =
        spot.adminRating != null && spot.adminRating >= 1 && spot.adminRating <= 5
          ? spot.adminRating
          : null;
      setAdminRatingCommitted(ar);
      setAdminRatedAtCommitted(spot.adminRatedAt ?? null);
      setAdminRatingDraft(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden des Spots:', error);
      showUserFriendlyError(error, toast, undefined, 'generic');
      navigate('/curated-spots');
    } finally {
      setLoadingSpot(false);
    }
  }, [spotId, navigate]);

  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  useEffect(() => {
    if (!spotId) return;
    queueMicrotask(() => {
      void loadSpot();
    });
  }, [spotId, loadSpot]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSuggestQ(suggestQ.trim()), 300);
    return () => clearTimeout(t);
  }, [suggestQ]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debouncedSuggestQ) {
        setSuggestions([]);
        return;
      }
      try {
        setSuggestLoading(true);
        const list = await spotKeywordServiceRef.current.suggest(debouncedSuggestQ, 25);
        if (!cancelled) setSuggestions(list);
      } catch (error) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error('Suggest-Fehler:', error);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedSuggestQ]);

  const addChip = (chip: Chip) => {
    setChips(prev => {
      const exists = prev.some(c =>
        c.kind === 'id' && chip.kind === 'id'
          ? c.id === chip.id
          : c.kind === 'new' && chip.kind === 'new'
            ? c.label.toLowerCase() === chip.label.toLowerCase()
            : false
      );
      if (exists) return prev;
      return [...prev, chip];
    });
  };

  const removeChip = (index: number) => {
    setChips(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFreeTag = () => {
    const label = newTagInput.trim();
    if (!label) return;
    if (label.length > 120) {
      toast.error('Tag max. 120 Zeichen.');
      return;
    }
    addChip({ kind: 'new', label });
    setNewTagInput('');
  };

  const handlePickSuggestion = (kw: SpotKeyword) => {
    addChip({ kind: 'id', id: kw.id, label: kw.name });
  };

  const handleLocationSelect = (location: LocationResult | null) => {
    if (!location) {
      setSearchValue(null);
      setAddress(emptyAddress());
      return;
    }
    setSearchValue(location);
    setAddress({
      street: location.address.street || '',
      houseNumber: location.address.houseNumber || '',
      postalCode: location.address.postalCode || '',
      city: location.address.city || '',
      latitude: location.position.lat,
      longitude: location.position.lng,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || !isAdminOrSuperAdmin) return;

    if (!name.trim()) {
      toast.error('Bitte einen Namen eingeben.');
      return;
    }
    if (!descriptionMarkdown.trim()) {
      toast.error('Bitte eine Beschreibung (Markdown) eingeben.');
      return;
    }
    if (!isValidHttpUrl(videoUrl) || !isValidHttpUrl(instagramUrl)) {
      toast.error('Video- oder Instagram-URL ist ungültig.');
      return;
    }
    if (!isAddressComplete(address)) {
      toast.error(
        'Bitte eine vollständige Adresse über die HERE-Suche wählen (Straße, Hausnummer, PLZ, Stadt und Koordinaten).'
      );
      return;
    }

    const addressPayload: BusinessAddress = {
      street: address.street.trim(),
      houseNumber: address.houseNumber.trim(),
      postalCode: address.postalCode.trim(),
      city: address.city.trim(),
      latitude: address.latitude,
      longitude: address.longitude,
    };

    const keywordIds = chips
      .filter((c): c is Extract<Chip, { kind: 'id' }> => c.kind === 'id')
      .map(c => c.id);
    const newKeywordNames = chips
      .filter((c): c is Extract<Chip, { kind: 'new' }> => c.kind === 'new')
      .map(c => c.label.trim());

    try {
      setSaving(true);

      if (!isEdit) {
        const created = await curatedSpotServiceRef.current.create({
          name: name.trim(),
          descriptionMarkdown: descriptionMarkdown.trim(),
          address: addressPayload,
          keywordIds: keywordIds.length ? keywordIds : undefined,
          newKeywordNames: newKeywordNames.length ? newKeywordNames : undefined,
          videoUrl: videoUrl.trim() || undefined,
          instagramUrl: instagramUrl.trim() || undefined,
          status,
          ...(adminRatingDraft != null && adminRatingDraft >= 1 && adminRatingDraft <= 5
            ? { adminRating: adminRatingDraft }
            : {}),
        });

        let spot = created;
        if (imageFiles.length > 0) {
          spot = await curatedSpotServiceRef.current.uploadImages(created.id, imageFiles);
        }
        if (videoFile) {
          spot = await curatedSpotServiceRef.current.uploadVideo(created.id, videoFile);
        }

        showSuccessMessage(toast, {
          title: 'Spot angelegt',
          description: `ID: ${spot.id}`,
        });
        navigate(`/curated-spots/${spot.id}/edit`);
        return;
      }

      if (!spotId) return;

      const patchBody: PatchCuratedSpotDto = {
        name: name.trim(),
        descriptionMarkdown: descriptionMarkdown.trim(),
        address: addressPayload,
        status,
        videoUrl: videoUrl.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        keywordIds,
      };
      if (newKeywordNames.length > 0) {
        patchBody.newKeywordNames = newKeywordNames;
      }
      if (
        adminRatingCommitted == null &&
        adminRatingDraft != null &&
        adminRatingDraft >= 1 &&
        adminRatingDraft <= 5
      ) {
        patchBody.adminRating = adminRatingDraft;
      }

      let updated = await curatedSpotServiceRef.current.patch(spotId, patchBody);

      if (imageFiles.length > 0) {
        updated = await curatedSpotServiceRef.current.uploadImages(spotId, imageFiles);
      }
      if (videoFile) {
        updated = await curatedSpotServiceRef.current.uploadVideo(spotId, videoFile);
      }

      setExistingImageUrls(updated.imageUrls || []);
      setImageFiles([]);
      setVideoFile(null);
      showSuccessMessage(toast, {
        title: 'Spot gespeichert',
        description: 'Änderungen wurden übernommen.',
      });
      await loadSpot();
    } catch (error) {
      showUserFriendlyError(error, toast, undefined, 'generic');
    } finally {
      setSaving(false);
    }
  };

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
