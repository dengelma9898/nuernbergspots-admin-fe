import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useEasterEggService } from '@/services/easterEggService';
import { CreateEasterEggDto, UpdateEasterEggDto } from '@/models/easter-egg';
import {
  showUserFriendlyError,
  showSuccessMessage,
  getUserFriendlyError,
} from '@/utils/errorUtils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { LocationData } from '@/components/ui/LocationSelector';

export interface EasterEggFormData {
  title: string;
  description: string;
  prizeDescription: string;
  numberOfWinners: number;
  startDate: string;
  endDate: string;
}

export function useEasterEggForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const easterEggService = useEasterEggService();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorsRef = useRef<HTMLDivElement>(null);

  const imageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });

  const [formData, setFormData] = useState<EasterEggFormData>({
    title: '',
    description: '',
    prizeDescription: '',
    numberOfWinners: 1,
    startDate: '',
    endDate: '',
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const loadEgg = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const egg = await easterEggService.getById(id);
      setFormData({
        title: egg.title,
        description: egg.description,
        prizeDescription: egg.prizeDescription || '',
        numberOfWinners: egg.numberOfWinners,
        startDate: egg.startDate,
        endDate: egg.endDate || '',
      });
      if (egg.location) {
        setLocationData({
          address: egg.location.address,
          latitude: egg.location.latitude,
          longitude: egg.location.longitude,
        });
      }
      if (egg.imageUrl) {
        setOriginalImageUrl(egg.imageUrl);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Ostereis:', error);
      showUserFriendlyError(error, toast, () => loadEgg(), 'load-easter-egg');
      navigate('/easter-egg-hunt');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEgg();
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
  };

  const removeImage = () => {
    imageUpload.clearImages();
    setOriginalImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Bitte geben Sie einen Titel ein');
    }
    if (!formData.description.trim()) {
      errors.push('Bitte geben Sie eine Beschreibung ein');
    }
    if (!formData.startDate) {
      errors.push('Bitte geben Sie ein Startdatum ein');
    }
    if (
      !locationData ||
      !locationData.address ||
      locationData.latitude === 0 ||
      locationData.longitude === 0
    ) {
      errors.push('Bitte wählen Sie einen Standort aus (Partner oder Adresssuche)');
    }
    if (formData.numberOfWinners < 1) {
      errors.push('Die Anzahl der Gewinner muss mindestens 1 sein');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      let eggId: string;

      if (id) {
        const updateData: UpdateEasterEggDto = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          prizeDescription: formData.prizeDescription.trim() || undefined,
          numberOfWinners: formData.numberOfWinners,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          address: locationData!.address,
          latitude: locationData!.latitude,
          longitude: locationData!.longitude,
        };

        const updatedEgg = await easterEggService.update(id, updateData);
        eggId = updatedEgg.id;

        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await easterEggService.uploadImage(eggId, imageUpload.files[0]);
        }

        showSuccessMessage(toast, {
          title: 'Osterei aktualisiert',
          description: `"${formData.title}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        const createData: CreateEasterEggDto = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          prizeDescription: formData.prizeDescription.trim() || undefined,
          numberOfWinners: formData.numberOfWinners,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          address: locationData!.address,
          latitude: locationData!.latitude,
          longitude: locationData!.longitude,
        };

        const newEgg = await easterEggService.create(createData);
        eggId = newEgg.id;

        if (imageUpload.files.length > 0) {
          setIsUploadingImage(true);
          await easterEggService.uploadImage(eggId, imageUpload.files[0]);
        }

        showSuccessMessage(toast, {
          title: 'Osterei erstellt',
          description: `"${formData.title}" wurde erfolgreich erstellt.`,
        });
      }

      navigate('/easter-egg-hunt');
    } catch (error) {
      console.error(`Fehler beim ${id ? 'Aktualisieren' : 'Erstellen'} des Ostereis:`, error);
      const friendlyError = getUserFriendlyError(error, 'save-easter-egg');

      if (friendlyError.validationMessages && friendlyError.validationMessages.length > 0) {
        setValidationErrors(friendlyError.validationMessages);
      } else {
        showUserFriendlyError(error, toast, () => handleSubmit(e), 'save-easter-egg');
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
    originalImageUrl,
    validationErrors,
    validationErrorsRef,
    imageUpload,
    formData,
    setFormData,
    locationData,
    setLocationData,
    handleImageSelect,
    removeImage,
    handleSubmit,
  };
}
