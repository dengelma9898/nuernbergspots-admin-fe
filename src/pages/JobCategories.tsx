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
      
      // Aktualisiere die Kategorie-Daten
      const updatedCategory = await jobCategoryService.updateCategory(editingCategory.id, categoryToUpdate);
      
      // Füge neue Bilder hinzu, falls vorhanden
      if (selectedImages.length > 0) {
        const finalCategory = await jobCategoryService.updateFallbackImages(updatedCategory.id, selectedImages);
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

  const removeImage = async (index: number) => {
    if (editingCategory && !selectedImages.length && previewUrls.length > 0) {
      try {
        // Hole die URL des zu entfernenden Bildes
        const imageToRemove = previewUrls[index];
        
        // Entferne das Bild über den separaten Endpoint
        await jobCategoryService.deleteFallbackImage(editingCategory.id, imageToRemove);
        
        // Aktualisiere den lokalen State
        const updatedUrls = previewUrls.filter((_, i) => i !== index);
        setPreviewUrls(updatedUrls);
        setNewCategory(prev => ({
          ...prev,
          fallbackImages: updatedUrls
        }));
        
        toast.success('Bild erfolgreich entfernt');
      } catch (error) {
        console.error('Fehler beim Entfernen des Bildes:', error);
        toast.error('Fehler beim Entfernen des Bildes');
      }
    } else {
      // Wenn wir ein neu ausgewähltes Bild entfernen
      setSelectedImages(selectedImages.filter((_, i) => i !== index));
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl relative z-10">
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
            Job-Kategorien verwalten
          </h1>
        </div>
      </div>

      {/* Überschrift und Button für mobile Ansicht */}
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="font-semibold text-lg text-white">Job-Kategorien</span>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetModalState}
                className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Neue Kategorie
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl backdrop-blur-3xl bg-white/10 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Name</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Kategoriename"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Icon</label>
                <IconPicker
                  value={newCategory.iconName}
                  onChange={(value) => setNewCategory({ ...newCategory, iconName: value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Beschreibung</label>
                <Input
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Beschreibung der Kategorie"
                  className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Farbe</label>
                <Input
                  type="color"
                  value={newCategory.colorCode}
                  onChange={(e) => setNewCategory({ ...newCategory, colorCode: e.target.value })}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Fallback-Bilder (max. 5)</label>
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
                        className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {previewUrls.length < 5 && (
                    <label className="flex items-center justify-center h-24 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <ImagePlus className="h-6 w-6 text-white/60" />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isSaving}
                  className="backdrop-blur-2xl bg-white/10 text-white hover:bg-white/20 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                >
                  <X className="mr-2 h-4 w-4" />
                  Abbrechen
                </Button>
                <Button 
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  disabled={isSaving}
                  className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
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
        </div>
      </div>

      {/* Mobile Card-Ansicht */}
      {isLoading ? (
        <div className="block md:hidden backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 text-center">
          <div className="text-white/90 text-lg">Lade Kategorien...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="block md:hidden backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 text-center">
          <div className="text-white/90 text-lg">Keine Kategorien vorhanden</div>
        </div>
      ) : (
        <div className="block md:hidden space-y-4">
          {categories.map((category) => (
            <Card key={category.id} className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-bold text-lg flex-1 text-white">{category.name}</div>
                <div className="text-white">{getIconComponent(category.iconName)}</div>
              </div>
              <div className="text-sm text-white/80 mb-2">{category.description || '-'}</div>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                  title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                />
                <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded">{convertFFToHex(category.colorCode)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {category.fallbackImages?.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Fallback ${index + 1}`}
                    className="w-8 h-8 object-cover rounded cursor-pointer border border-white/30 hover:scale-110 transition-transform"
                    onClick={() => setSelectedImagePreview(image)}
                  />
                ))}
              </div>
              <div className="text-xs text-white/70 mb-2">
                Erstellt: {new Date(category.createdAt).toLocaleDateString()}<br />
                Aktualisiert: {new Date(category.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEditCategory(category)} 
                  className="cursor-pointer backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                >
                  <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteCategory(category.id)} 
                  className="cursor-pointer backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Löschen
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Desktop/Table Ansicht */}
      <div className="hidden md:block backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
        <Table>
        <TableHeader>
          <TableRow className="border-white/20 hover:bg-white/5">
            <TableHead className="text-white/90 font-semibold">Name</TableHead>
            <TableHead className="text-white/90 font-semibold">Icon</TableHead>
            <TableHead className="text-white/90 font-semibold">Beschreibung</TableHead>
            <TableHead className="text-white/90 font-semibold">Farbe</TableHead>
            <TableHead className="text-white/90 font-semibold">Erstellt am</TableHead>
            <TableHead className="text-white/90 font-semibold">Aktualisiert am</TableHead>
            <TableHead className="text-white/90 font-semibold">Fallback-Bilder</TableHead>
            <TableHead className="w-[100px] text-white/90 font-semibold">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableCell colSpan={8} className="text-center text-white/90 py-8">
                Lade Kategorien...
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableCell colSpan={8} className="text-center text-white/90 py-8">
                Keine Kategorien vorhanden
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id} className="border-white/20 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-white">{category.name}</TableCell>
                <TableCell className="text-white">
                  {getIconComponent(category.iconName)}
                </TableCell>
                <TableCell className="text-white/90">{category.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-border hover:scale-150 transition-transform cursor-help"
                      style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                      title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                    />
                    <code className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded">
                      {convertFFToHex(category.colorCode)}
                    </code>
                  </div>
                </TableCell>
                <TableCell className="text-white/90">{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-white/90">{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
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
                          className="w-8 h-8 object-cover rounded border border-white/30 hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 backdrop-blur-2xl bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110 rounded-lg text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="backdrop-blur-3xl bg-white/10 border-white/20">
                      <DropdownMenuItem 
                        onClick={() => handleEditCategory(category)}
                        className="text-white hover:bg-white/20 cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-300 hover:bg-red-500/20 cursor-pointer"
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
      </div>

      {/* Bildvorschau Dialog */}
      <Dialog open={!!selectedImagePreview} onOpenChange={(open) => !open && setSelectedImagePreview(null)}>
        <DialogContent className="max-w-4xl backdrop-blur-3xl bg-white/10 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Bildvorschau</DialogTitle>
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
    </div>
  );
} 