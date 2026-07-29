import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  CreateAdventCalendarEntryDto,
  UpdateAdventCalendarEntryDto,
} from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import {
  showUserFriendlyError,
  showSuccessMessage,
  getUserFriendlyError,
} from '@/utils/errorUtils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

function normalizeUrl(urlString: string): string {
  if (!urlString || !urlString.trim()) {
    return '';
  }

  const trimmed = urlString.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidUrl(urlString: string): boolean {
  if (!urlString || !urlString.trim()) {
    return true;
  }

  try {
    const normalized = normalizeUrl(urlString);
    const url = new URL(normalized);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function useAdventCalendarForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adventCalendarService = useAdventCalendarService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);

  const imageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });

  const [formData, setFormData] = useState<CreateAdventCalendarEntryDto>({
    number: 1,
    canParticipate: true,
    isActive: true,
    date: new Date().toISOString().split('T')[0],
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
        setOriginalImageUrl(entry.imageUrl);
        setShouldDeleteImage(false);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Eintrags:', error);
      showUserFriendlyError(error, toast, () => loadEntry(), 'load-advent-calendar');
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

  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorsRef.current) {
      setTimeout(() => {
        validationErrorsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [validationErrors]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
    if (imageUpload.files.length > 0) {
      setShouldDeleteImage(false);
    }
  };

  const removeImage = () => {
    imageUpload.clearImages();
    if (originalImageUrl) {
      setShouldDeleteImage(true);
      setOriginalImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!formData.description.trim()) {
      errors.push('Bitte geben Sie eine Beschreibung ein');
    }

    if (formData.number < 1) {
      errors.push('Das Adventstürchen muss mindestens 1 sein');
    }

    if (formData.linkUrl && formData.linkUrl.trim() && !isValidUrl(formData.linkUrl)) {
      errors.push('Bitte geben Sie eine gültige URL ein');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      let entryId: string;

      if (id) {
        const updateData: UpdateAdventCalendarEntryDto = {
          number: formData.number,
          canParticipate: formData.canParticipate,
          isActive: formData.isActive,
          date: formData.date,
          isSpecial: formData.isSpecial,
          description: formData.description,
          linkUrl: formData.linkUrl?.trim() ? normalizeUrl(formData.linkUrl.trim()) : undefined,
        };

        if (shouldDeleteImage && imageUpload.files.length === 0) {
          updateData.imageUrl = null;
        }

        const updatedEntry = await adventCalendarService.update(id, updateData);
        entryId = updatedEntry.id;

        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await adventCalendarService.uploadImage(entryId, imageUpload.files[0]);
        }

        setShouldDeleteImage(false);

        showSuccessMessage(toast, {
          title: 'Eintrag aktualisiert',
          description: `Eintrag #${formData.number} wurde erfolgreich aktualisiert.`,
        });
      } else {
        const createData: CreateAdventCalendarEntryDto = {
          ...formData,
          linkUrl: formData.linkUrl?.trim() ? normalizeUrl(formData.linkUrl.trim()) : undefined,
        };
        const newEntry = await adventCalendarService.create(createData);
        entryId = newEntry.id;

        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await adventCalendarService.uploadImage(entryId, imageUpload.files[0]);
        }

        showSuccessMessage(toast, {
          title: 'Eintrag erstellt',
          description: `Eintrag #${formData.number} wurde erfolgreich erstellt.`,
        });
      }

      navigate('/advent-calendar');
    } catch (error) {
      console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Eintrags:`, error);
      const friendlyError = getUserFriendlyError(error, 'save-advent-calendar');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(e), 'save-advent-calendar');
      }
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  return {
    id,
    navigate,
    isLoading,
    isSaving,
    isUploadingImage,
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    validationErrorsRef,
    imageUpload,
    originalImageUrl,
    handleImageSelect,
    removeImage,
    handleSubmit,
  };
}
