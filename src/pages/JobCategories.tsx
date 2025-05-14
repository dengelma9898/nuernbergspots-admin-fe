import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Check,
  X,
  ArrowLeft,
  ImagePlus
} from 'lucide-react';
import { toast } from 'sonner';
import { JobCategory, JobCategoryCreation } from '@/models/job-category';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { getIconComponent } from '@/utils/iconUtils';
import { IconPicker } from '@/components/ui/icon-picker';
import { convertFFToHex, convertHexToFF } from '@/utils/colorUtils';

const toSnakeCase = (str: string): string => {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export function JobCategories() {
  const jobCategoryService = useJobCategoryService();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null);
  const [newCategory, setNewCategory] = useState<JobCategoryCreation>({
    name: '',
    description: '',
    colorCode: '#000000',
    iconName: '',
    fallbackImages: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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
      toast.error('Fehler beim Laden der Kategorien');
      console.error('Fehler beim Laden der Kategorien:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    try {
      setIsSaving(true);
      const categoryToSave = {
        ...newCategory,
        iconName: toSnakeCase(newCategory.iconName),
        colorCode: convertHexToFF(newCategory.colorCode)
      };
      
      const category = await jobCategoryService.createCategory(categoryToSave);
      
      if (selectedImages.length > 0) {
        await jobCategoryService.updateFallbackImages(category.id, selectedImages);
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
        fallbackImages: []
      });
      setSelectedImages([]);
      setPreviewUrls([]);
      setIsDialogOpen(false);
      toast.success('Kategorie hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen der Kategorie');
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
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
      fallbackImages: category.fallbackImages
    });
    
    if (category.fallbackImages && category.fallbackImages.length > 0) {
      setPreviewUrls(category.fallbackImages);
      setSelectedImages([]);
    } else {
      setPreviewUrls([]);
      setSelectedImages([]);
    }
    
    setIsDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategory.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    try {
      setIsSaving(true);
      const categoryToUpdate = {
        ...newCategory,
        iconName: toSnakeCase(newCategory.iconName),
        colorCode: convertHexToFF(newCategory.colorCode)
      };
      
      const updatedCategory = await jobCategoryService.updateCategory(editingCategory.id, categoryToUpdate);
      
      if (selectedImages.length > 0) {
        await jobCategoryService.updateFallbackImages(updatedCategory.id, selectedImages);
        const finalCategory = await jobCategoryService.getCategory(updatedCategory.id);
        setCategories(prev => prev.map(cat => 
          cat.id === updatedCategory.id ? finalCategory : cat
        ));
      } else {
        setCategories(prev => prev.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        ));
      }
      
      setEditingCategory(null);
      setNewCategory({
        name: '',
        description: '',
        colorCode: '#000000',
        iconName: '',
        fallbackImages: []
      });
      setSelectedImages([]);
      setPreviewUrls([]);
      setIsDialogOpen(false);
      toast.success('Kategorie aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Kategorie');
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await jobCategoryService.deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast.success('Kategorie gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen der Kategorie');
      console.error('Fehler beim Löschen der Kategorie:', error);
    }
  };

  const resetModalState = () => {
    setEditingCategory(null);
    setNewCategory({
      name: '',
      description: '',
      colorCode: '#000000',
      iconName: '',
      fallbackImages: []
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    if (editingCategory && !selectedImages.length && previewUrls.length > 0) {
      const updatedUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(updatedUrls);
    } else {
      setSelectedImages(selectedImages.filter((_, i) => i !== index));
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Job-Kategorien verwalten</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Job-Kategorien</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button onClick={resetModalState}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Kategorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Kategoriename"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <IconPicker
                    value={newCategory.iconName}
                    onChange={(value) => setNewCategory({ ...newCategory, iconName: value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Input
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Beschreibung der Kategorie"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Farbe</label>
                  <Input
                    type="color"
                    value={newCategory.colorCode}
                    onChange={(e) => setNewCategory({ ...newCategory, colorCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fallback-Bilder (max. 5)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {previewUrls.length < 5 && (
                      <label className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                  <Button 
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {editingCategory ? 'Wird gespeichert...' : 'Wird erstellt...'}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Farbe</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead>Aktualisiert am</TableHead>
                <TableHead>Fallback-Bilder</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Lade Kategorien...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Keine Kategorien vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {getIconComponent(category.iconName)}
                    </TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-border hover:scale-150 transition-transform cursor-help"
                          style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                          title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                        />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {convertFFToHex(category.colorCode)}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.fallbackImages?.map((image, index) => (
                          <div 
                            key={index}
                            className="relative cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setSelectedImagePreview(image)}
                          >
                            <img
                              src={image}
                              alt={`Fallback ${index + 1}`}
                              className="w-8 h-8 object-cover rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bildvorschau Dialog */}
      <Dialog open={!!selectedImagePreview} onOpenChange={(open) => !open && setSelectedImagePreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bildvorschau</DialogTitle>
          </DialogHeader>
          {selectedImagePreview && (
            <div className="relative w-full h-[70vh]">
              <img
                src={selectedImagePreview}
                alt="Vollbildvorschau"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 