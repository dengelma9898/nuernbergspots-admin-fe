import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { JobCategory, JobCategoryCreation } from '@/models/job-category';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

export const convertFFToHex = (ffColor: string): string =>
  `#${ffColor.replace('0x', '').slice(-6)}`;
export const convertHexToFF = (hexColor: string): string => `0xff${hexColor.replace('#', '')}`;
export const toSnakeCase = (str: string): string =>
  str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

export function useJobCategories() {
  const jobCategoryService = useJobCategoryService();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null);
  const [newCategory, setNewCategory] = useState<JobCategoryCreation>({
    name: '',
    description: '',
    colorCode: '#000000',
    iconName: '',
    fallbackImages: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Bestehende Bilder vom Backend

  // Zentrale Bildvalidierung für neue Bilder (max 1 MB pro Bild, max 5 Bilder)
  const imageUpload = useValidatedImageUpload({
    maxImages: 5,
    maxSizeMB: 1,
  });
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await jobCategoryService.getCategories();
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
      };

      const category = await jobCategoryService.createCategory(categoryToSave);

      if (imageUpload.files.length > 0) {
        await jobCategoryService.updateFallbackImages(category.id, imageUpload.files);
        const updatedCategory = await jobCategoryService.getCategory(category.id);
        setCategories(prev => [...prev, updatedCategory]);
      } else {
        setCategories(prev => [...prev, category]);
      }

      setNewCategory({
        name: '',
        description: '',
        colorCode: '#000000',
        iconName: '',
        fallbackImages: [],
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

  const handleEditCategory = (category: JobCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      colorCode: convertFFToHex(category.colorCode),
      iconName: category.iconName,
      fallbackImages: category.fallbackImages,
    });

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
      };

      // Aktualisiere die Kategorie-Daten
      const updatedCategory = await jobCategoryService.updateCategory(
        editingCategory.id,
        categoryToUpdate
      );

      // Füge neue Bilder hinzu, falls vorhanden
      if (imageUpload.files.length > 0) {
        const finalCategory = await jobCategoryService.updateFallbackImages(
          updatedCategory.id,
          imageUpload.files
        );
        setCategories(prev =>
          prev.map(cat => (cat.id === updatedCategory.id ? finalCategory : cat))
        );
      } else {
        setCategories(prev =>
          prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
        );
      }

      setEditingCategory(null);
      setNewCategory({
        name: '',
        description: '',
        colorCode: '#000000',
        iconName: '',
        fallbackImages: [],
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
      await jobCategoryService.deleteCategory(categoryId);
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
      fallbackImages: [],
    });
    imageUpload.clearImages();
    setExistingImageUrls([]);
    setValidationErrors([]);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    imageUpload.handleFileChange(e);
  };

  const removeImage = async (index: number, isExisting: boolean) => {
    if (isExisting && editingCategory) {
      try {
        // Hole die URL des zu entfernenden Bildes
        const imageToRemove = existingImageUrls[index];

        // Entferne das Bild über den separaten Endpoint
        await jobCategoryService.deleteFallbackImage(editingCategory.id, imageToRemove);

        // Aktualisiere den lokalen State
        const updatedUrls = existingImageUrls.filter((_, i) => i !== index);
        setExistingImageUrls(updatedUrls);
        setNewCategory(prev => ({
          ...prev,
          fallbackImages: updatedUrls,
        }));

        showSuccessMessage(toast, {
          title: 'Bild erfolgreich entfernt',
          description: 'Das Bild wurde erfolgreich aus der Kategorie entfernt.',
        });
      } catch (error) {
        console.error('Fehler beim Entfernen des Bildes:', error);
        showUserFriendlyError(error, toast, undefined, 'upload-image');
      }
    } else {
      // Wenn wir ein neu ausgewähltes Bild entfernen
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
    jobCategoryService,
    imageUpload,
    loadCategories,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    resetModalState,
    handleDialogChange,
    handleImageSelect,
    removeImage,
  };
}
