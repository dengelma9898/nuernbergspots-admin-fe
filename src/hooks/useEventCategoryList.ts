import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';
import { EventCategory, EventCategoryCreation } from '@/models/event-category';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

export const convertFFToHex = (ffColor: string): string =>
  `#${ffColor.replace('0x', '').slice(-6)}`;
export const convertHexToFF = (hexColor: string): string => `0xff${hexColor.replace('#', '')}`;
export const toSnakeCase = (str: string): string =>
  str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

export function useEventCategoryList() {
  const eventCategoryService = useEventCategoryService();
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [newCategory, setNewCategory] = useState<EventCategoryCreation>({
    name: '',
    description: '',
    colorCode: '#000000',
    iconName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Bestehende Bilder vom Backend
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Zentrale Bildvalidierung für neue Bilder (max 1 MB pro Bild, max 5 Bilder)
  const imageUpload = useValidatedImageUpload({
    maxImages: 5,
    maxSizeMB: 1,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await eventCategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast, () => loadCategories(), 'load-categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setValidationErrors(['Bitte geben Sie einen Namen ein']);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      const categoryToSave = {
        ...newCategory,
        iconName: toSnakeCase(newCategory.iconName),
        colorCode: convertHexToFF(newCategory.colorCode),
        fallbackImages: existingImageUrls, // Bestehende Bilder (leer beim Erstellen)
      };
      const category = await eventCategoryService.createCategory(categoryToSave);

      // Wenn neue Bilder ausgewählt wurden, lade diese hoch
      if (imageUpload.files.length > 0) {
        await eventCategoryService.updateFallbackImages(category.id, imageUpload.files);
      }

      setCategories([...categories, category]);
      setNewCategory({
        name: '',
        description: '',
        colorCode: '#000000',
        iconName: '',
      });
      imageUpload.clearImages();
      setExistingImageUrls([]);
      setIsDialogOpen(false);
      setValidationErrors([]);
      showSuccessMessage(toast, {
        title: 'Kategorie hinzugefügt',
        description: `"${category.name}" wurde erfolgreich hinzugefügt.`,
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      showUserFriendlyError(error, toast, () => handleAddCategory(), 'save-category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = (category: EventCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      colorCode: convertFFToHex(category.colorCode),
      iconName: category.iconName,
    });

    // Setze die vorhandenen Fallback-Bilder
    if (category.fallbackImages && category.fallbackImages.length > 0) {
      setExistingImageUrls(category.fallbackImages);
    } else {
      setExistingImageUrls([]);
    }
    imageUpload.clearImages();

    setIsDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategory.name.trim()) {
      setValidationErrors(['Bitte geben Sie einen Namen ein']);
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);
      const categoryToUpdate = {
        ...newCategory,
        iconName: toSnakeCase(newCategory.iconName),
        colorCode: convertHexToFF(newCategory.colorCode),
        fallbackImages: existingImageUrls, // Bestehende Bilder
      };
      const updatedCategory = await eventCategoryService.updateCategory(
        editingCategory.id,
        categoryToUpdate
      );

      // Wenn neue Bilder ausgewählt wurden, lade diese hoch
      if (imageUpload.files.length > 0) {
        const categoryWithImages = await eventCategoryService.updateFallbackImages(
          editingCategory.id,
          imageUpload.files
        );
        setCategories(
          categories.map(cat => (cat.id === editingCategory.id ? categoryWithImages : cat))
        );
      } else {
        setCategories(
          categories.map(cat => (cat.id === editingCategory.id ? updatedCategory : cat))
        );
      }

      setEditingCategory(null);
      setNewCategory({
        name: '',
        description: '',
        colorCode: '#000000',
        iconName: '',
      });
      imageUpload.clearImages();
      setExistingImageUrls([]);
      setIsDialogOpen(false);
      setValidationErrors([]);
      showSuccessMessage(toast, {
        title: 'Kategorie aktualisiert',
        description: `"${updatedCategory.name}" wurde erfolgreich aktualisiert.`,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      showUserFriendlyError(error, toast, () => handleUpdateCategory(), 'save-category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      await eventCategoryService.deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      showSuccessMessage(toast, {
        title: 'Kategorie gelöscht',
        description: categoryToDelete
          ? `"${categoryToDelete.name}" wurde erfolgreich gelöscht.`
          : 'Die Kategorie wurde erfolgreich gelöscht.',
      });
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      showUserFriendlyError(error, toast, undefined, 'delete-category');
    }
  };

  const resetModalState = () => {
    setEditingCategory(null);
    setNewCategory({
      name: '',
      description: '',
      colorCode: '#000000',
      iconName: '',
    });
    imageUpload.clearImages();
    setExistingImageUrls([]);
    setValidationErrors([]);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
      loadCategories();
    }
  };

  const handleImageUpload = async (categoryId: string) => {
    if (imageUpload.files.length === 0) return;

    try {
      const updatedCategory = await eventCategoryService.updateFallbackImages(
        categoryId,
        imageUpload.files
      );
      setCategories(categories.map(cat => (cat.id === categoryId ? updatedCategory : cat)));
      imageUpload.clearImages();
      showSuccessMessage(toast, {
        title: 'Bilder erfolgreich hochgeladen',
        description: `${imageUpload.files.length} Bild${imageUpload.files.length > 1 ? 'er' : ''} wurde${imageUpload.files.length > 1 ? 'n' : ''} erfolgreich hochgeladen.`,
      });
    } catch (error) {
      console.error('Fehler beim Hochladen der Bilder:', error);
      showUserFriendlyError(error, toast, () => handleUploadImages(categoryId), 'upload-image');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Entferne bestehendes Bild
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      // Entferne neues Bild
      imageUpload.removeImage(index);
    }
  };

  return {
    categories,
    setCategories,
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    setEditingCategory,
    newCategory,
    setNewCategory,
    isLoading,
    setIsLoading,
    validationErrors,
    setValidationErrors,
    existingImageUrls,
    setExistingImageUrls,
    selectedImagePreview,
    setSelectedImagePreview,
    isSaving,
    setIsSaving,
    navigate,
    eventCategoryService,
    imageUpload,
    loadCategories,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    resetModalState,
    handleDialogChange,
    handleImageUpload,
    handleImageSelect,
    removeImage,
  };
}
