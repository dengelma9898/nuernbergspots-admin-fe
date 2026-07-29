import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { BusinessCategory, BusinessCategoryCreation } from '@/models/business-category';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

export const toSnakeCase = (str: string): string => {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export function useCategoryList() {
  const businessCategoryService = useBusinessCategoryService();
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BusinessCategory | null>(null);
  const [newCategory, setNewCategory] = useState<BusinessCategoryCreation>({
    name: '',
    description: '',
    iconName: '',
    keywordIds: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await businessCategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      showUserFriendlyError(error, toast, undefined, 'load-categories');
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
      const categoryToSave = {
        ...newCategory,
        iconName: toSnakeCase(newCategory.iconName),
      };
      const category = await businessCategoryService.createCategory(categoryToSave);
      setCategories([...categories, category]);
      setNewCategory({
        name: '',
        description: '',
        iconName: '',
        keywordIds: [],
      });
      setIsDialogOpen(false);
      setValidationErrors([]);
      showSuccessMessage(toast, {
        title: 'Kategorie hinzugefügt',
        description: `"${category.name}" wurde erfolgreich hinzugefügt.`,
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      showUserFriendlyError(error, toast, undefined, 'save-category');
    }
  };

  const handleEditCategory = (category: BusinessCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      iconName: category.iconName,
      keywordIds: category.keywords?.map(k => k.id) || [],
    });
    setIsDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategory.name.trim()) {
      setValidationErrors(['Bitte geben Sie einen Namen ein']);
      return;
    }

    setValidationErrors([]);

    try {
      const categoryToUpdate = {
        ...newCategory,
        iconName: toSnakeCase(newCategory.iconName),
      };
      const updatedCategory = await businessCategoryService.updateCategory(
        editingCategory.id,
        categoryToUpdate
      );
      setCategories(categories.map(cat => (cat.id === editingCategory.id ? updatedCategory : cat)));
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', iconName: '', keywordIds: [] });
      setIsDialogOpen(false);
      setValidationErrors([]);
      showSuccessMessage(toast, {
        title: 'Kategorie aktualisiert',
        description: `"${updatedCategory.name}" wurde erfolgreich aktualisiert.`,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      showUserFriendlyError(error, toast, undefined, 'save-category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      await businessCategoryService.deleteCategory(categoryId);
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
      iconName: '',
      keywordIds: [],
    });
    setValidationErrors([]);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
      loadCategories();
    }
  };

  return {
    navigate,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    newCategory,
    setNewCategory,
    isLoading,
    validationErrors,
    setValidationErrors,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    resetModalState,
    handleDialogChange,
  };
}
