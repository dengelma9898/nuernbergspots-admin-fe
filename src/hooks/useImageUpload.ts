import { useState, useCallback } from 'react';
import { Event } from '@/models/events';
import { useEventService } from '@/services/eventService';
import { toast } from 'sonner';

interface UseImageUploadProps {
  event: Event | null;
  onEventUpdate: () => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  isUploadingTitleImage: boolean;
  isDeletingImage: boolean;
  selectedFiles: File[];
  previewUrls: string[];
  imageToDelete: string | null;
  imagesChanged: boolean;
  imageLimitError: string | null;
  setSelectedFiles: (files: File[]) => void;
  setPreviewUrls: (urls: string[]) => void;
  setImageToDelete: (url: string | null) => void;
  setImagesChanged: (value: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTitleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadImages: (files?: File[]) => Promise<void>;
  handleUploadTitleImage: (file?: File) => Promise<void>;
  removePreview: (index: number) => void;
  handleDeleteImage: (imageUrl: string) => void;
  confirmDeleteImage: () => Promise<void>;
  handleConfirmImages: () => void;
}

export const useImageUpload = ({
  event,
  onEventUpdate,
}: UseImageUploadProps): UseImageUploadReturn => {
  const eventService = useEventService();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTitleImage, setIsUploadingTitleImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [imagesChanged, setImagesChanged] = useState(false);
  const [imageLimitError, setImageLimitError] = useState<string | null>(null);

  const handleUploadImages = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || !event) return;
      try {
        setIsUploading(true);
        await eventService.uploadEventImages(event.id, files);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setImagesChanged(true);
        toast.success(`Bilder erfolgreich hochgeladen`);
        onEventUpdate();
      } catch (error) {
        console.error('Fehler beim Hochladen der Bilder:', error);
        toast.error('Fehler beim Hochladen der Bilder');
      } finally {
        setIsUploading(false);
      }
    },
    [event, eventService, onEventUpdate]
  );

  const handleUploadTitleImage = useCallback(
    async (file: File) => {
      if (!file || !event) return;
      try {
        setIsUploadingTitleImage(true);
        const imageUrl = await eventService.uploadEventTitleImage(event.id, file);
        const updatedEvent = {
          ...event,
          titleImageUrl: imageUrl,
        };
        await eventService.updateEvent(event.id, updatedEvent);
        setImagesChanged(true);
        toast.success('Titelbild erfolgreich aktualisiert');
        onEventUpdate();
      } catch (error) {
        console.error('Fehler beim Hochladen des Titelbildes:', error);
        toast.error('Fehler beim Hochladen des Titelbildes');
      } finally {
        setIsUploadingTitleImage(false);
      }
    },
    [event, eventService, onEventUpdate]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && event) {
        const files = Array.from(e.target.files);
        const totalImages = (event.imageUrls?.length || 0) + files.length;
        if (totalImages > 5) {
          setImageLimitError('Maximal 5 Bilder erlaubt.');
          return;
        }
        setImageLimitError(null);
        setSelectedFiles(files);
        // Automatischer Upload
        handleUploadImages(files);
      }
    },
    [event, handleUploadImages]
  );

  const handleTitleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && event) {
        // Automatischer Upload
        handleUploadTitleImage(file);
      }
    },
    [event, handleUploadTitleImage]
  );

  const removePreview = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDeleteImage = useCallback((imageUrl: string) => {
    setImageToDelete(imageUrl);
  }, []);

  const confirmDeleteImage = useCallback(async () => {
    if (!event || !event.imageUrls || !imageToDelete) return;

    try {
      setIsDeletingImage(true);
      await eventService.removeEventImage(event.id, imageToDelete);
      setImagesChanged(true);
      toast.success('Bild erfolgreich entfernt');
      onEventUpdate();
    } catch (error) {
      console.error('Fehler beim Entfernen des Bildes:', error);
      toast.error('Fehler beim Entfernen des Bildes');
    } finally {
      setIsDeletingImage(false);
      setImageToDelete(null);
    }
  }, [event, imageToDelete, eventService, onEventUpdate]);

  const handleConfirmImages = useCallback(() => {
    setImagesChanged(false);
    onEventUpdate();
    toast.success('Bilder aktualisiert und bestätigt.');
  }, [onEventUpdate]);

  return {
    isUploading,
    isUploadingTitleImage,
    isDeletingImage,
    selectedFiles,
    previewUrls,
    imageToDelete,
    imagesChanged,
    imageLimitError,
    setSelectedFiles,
    setPreviewUrls,
    setImageToDelete,
    setImagesChanged,
    handleFileChange,
    handleTitleImageChange,
    handleUploadImages,
    handleUploadTitleImage,
    removePreview,
    handleDeleteImage,
    confirmDeleteImage,
    handleConfirmImages,
  };
};
