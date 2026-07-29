import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { useCuratedSpotService } from '@/services/curatedSpotService';
import { useSpotKeywordService } from '@/services/spotKeywordService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { BusinessAddress } from '@/models/business-address';
import { CuratedSpotStatus, PatchCuratedSpotDto } from '@/models/curated-spot';
import { SpotKeyword } from '@/models/spot-keyword';
import { UserType } from '@/models/users';
import { LocationResult } from '@/components/ui/LocationSearch';

type Chip = { kind: 'id'; id: string; label: string } | { kind: 'new'; label: string };

export function chipKey(c: Chip, index: number): string {
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

export function isAddressComplete(a: BusinessAddress): boolean {
  return (
    a.street.trim().length > 0 &&
    a.houseNumber.trim().length > 0 &&
    a.postalCode.trim().length > 0 &&
    a.city.trim().length > 0 &&
    !(a.latitude === 0 && a.longitude === 0)
  );
}

export function formatAdminRatedAt(iso: string | null | undefined): string | null {
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

export function useCuratedSpotForm() {
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

  return {
    spotId,
    isEdit,
    isAdminOrSuperAdmin,
    userRole,
    setUserRole,
    loadingSpot,
    setLoadingSpot,
    saving,
    setSaving,
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
    setChips,
    suggestQ,
    setSuggestQ,
    debouncedSuggestQ,
    setDebouncedSuggestQ,
    suggestions,
    setSuggestions,
    suggestLoading,
    setSuggestLoading,
    newTagInput,
    setNewTagInput,
    imageFiles,
    setImageFiles,
    videoFile,
    setVideoFile,
    existingImageUrls,
    setExistingImageUrls,
    address,
    setAddress,
    searchValue,
    setSearchValue,
    adminRatingCommitted,
    setAdminRatingCommitted,
    adminRatedAtCommitted,
    setAdminRatedAtCommitted,
    adminRatingDraft,
    setAdminRatingDraft,
    navigate,
    loadUserRole,
    loadSpot,
    addChip,
    removeChip,
    handleAddFreeTag,
    handlePickSuggestion,
    handleLocationSelect,
    handleSubmit,
  };
}
