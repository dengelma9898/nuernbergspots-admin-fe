import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, ArrowLeft, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { JobCategory, JobCategoryCreation } from '@/models/job-category';
import { useJobCategoryService } from '@/services/jobCategoryService';
import { getIconComponent } from '@/utils/iconUtils';
import { IconPicker } from '@/components/ui/icon-picker';
import { convertFFToHex, convertHexToFF } from '@/utils/colorUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const toSnakeCase = (str: string): string => {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

function JobCategorySkeleton() {
  return (
    <Card className={cn(glassCard, 'rounded-2xl p-4')}>
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>

      <Skeleton className="h-4 w-full rounded mb-2" />

      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-8 rounded" />
        ))}
      </div>

      <div className="mb-2">
        <Skeleton className="h-3 w-32 rounded mb-1" />
        <Skeleton className="h-3 w-36 rounded" />
      </div>

      <div className="flex gap-2 mt-2">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </Card>
  );
}

function JobCategoryTableSkeleton() {
  return (
    <Card className={cn(glassCard, 'hidden md:block overflow-hidden')}>
      <Table>
        <TableHeader>
          <TableRow className="border-secondary hover:bg-muted/50">
            <TableHead className="text-foreground font-semibold">Name</TableHead>
            <TableHead className="text-foreground font-semibold">Icon</TableHead>
            <TableHead className="text-foreground font-semibold">Beschreibung</TableHead>
            <TableHead className="text-foreground font-semibold">Farbe</TableHead>
            <TableHead className="text-foreground font-semibold">Erstellt am</TableHead>
            <TableHead className="text-foreground font-semibold">Aktualisiert am</TableHead>
            <TableHead className="text-foreground font-semibold">Fallback-Bilder</TableHead>
            <TableHead className="w-[100px] text-foreground font-semibold">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="border-secondary hover:bg-muted/50 transition-colors">
              <TableCell>
                <Skeleton className="h-4 w-32 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-6 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48 rounded" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24 rounded" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 2 }).map((_, imgIndex) => (
                    <Skeleton
                      key={imgIndex}
                      className="h-8 w-8 rounded"
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

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
    fallbackImages: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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
      showUserFriendlyError(error, toast);
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
      toast.success('Kategorie hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      showUserFriendlyError(error, toast);
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
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

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
      toast.success('Kategorie aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      showUserFriendlyError(error, toast);
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
      console.error('Fehler beim Löschen der Kategorie:', error);
      showUserFriendlyError(error, toast);
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

        toast.success('Bild erfolgreich entfernt');
      } catch (error) {
        console.error('Fehler beim Entfernen des Bildes:', error);
        showUserFriendlyError(error, toast);
      }
    } else {
      // Wenn wir ein neu ausgewähltes Bild entfernen
      imageUpload.removeImage(index);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="container mx-auto p-8 max-w-7xl relative z-10">
          <motion.div
            className={cn(glassCard, 'p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex items-center gap-4">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Dashboard
              </AnimatedButton>
              <h1 className="text-2xl font-bold text-foreground">
                Job-Kategorien verwalten
              </h1>
            </div>
          </motion.div>

          {/* Überschrift und Button für mobile Ansicht */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="font-semibold text-lg text-foreground">Job-Kategorien</span>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <AnimatedButton
                    onClick={resetModalState}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neue Kategorie
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className={cn(glassCard, 'max-w-2xl')}>
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Name</label>
                      <Input
                        value={newCategory.name}
                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Kategoriename"
                        className={cn(glassInput)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Icon</label>
                      <IconPicker
                        value={newCategory.iconName}
                        onChange={value => setNewCategory({ ...newCategory, iconName: value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Beschreibung</label>
                      <Input
                        value={newCategory.description}
                        onChange={e =>
                          setNewCategory({ ...newCategory, description: e.target.value })
                        }
                        placeholder="Beschreibung der Kategorie"
                        className={cn(glassInput)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Farbe</label>
                      <Input
                        type="color"
                        value={newCategory.colorCode}
                        onChange={e => setNewCategory({ ...newCategory, colorCode: e.target.value })}
                        className={cn(glassInput, 'h-12')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Fallback-Bilder (max. 5)
                      </label>
                      {imageUpload.error && (
                        <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{imageUpload.error.title}</AlertTitle>
                          <AlertDescription className="mt-2">
                            <p>{imageUpload.error.message}</p>
                            {imageUpload.error.actionHint && (
                              <p className="mt-2 text-sm opacity-90">{imageUpload.error.actionHint}</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-5 gap-2">
                        {/* Bestehende Bilder */}
                        {existingImageUrls.map((url, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <img
                              src={url}
                              alt={`Bild ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index, true)}
                              className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                              aria-label="Bild entfernen"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {/* Neue Bilder */}
                        {imageUpload.previewUrls.map((url, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index, false)}
                              className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                              aria-label="Bild entfernen"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {(existingImageUrls.length + imageUpload.previewUrls.length) < 5 && (
                          <label className={cn(glassCard, 'flex items-center justify-center h-24 border-2 border-dashed cursor-pointer hover:border-secondary/50 transition-colors')}>
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
                      <AnimatedButton
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSaving}
                        className={cn(glassButton)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Abbrechen
                      </AnimatedButton>
                      <LoadingButton
                        onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isSaving ? (
                          <>
                            {editingCategory ? 'Wird gespeichert...' : 'Wird erstellt...'}
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
                          </>
                        )}
                      </LoadingButton>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Mobile Card-Ansicht */}
          {isLoading ? (
            <motion.div
              className="block md:hidden space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <JobCategorySkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Card className={cn(glassCard, 'block md:hidden p-8 text-center')}>
                <div className="text-muted-foreground text-lg">Keine Kategorien vorhanden</div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="block md:hidden space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {categories.map((category, index) => (
                <motion.div key={category.id} variants={fadeInUp}>
                  <Card className={cn(glassCard, 'rounded-2xl p-4')}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-bold text-lg flex-1 text-foreground">{category.name}</div>
                      <div className="text-foreground">{getIconComponent(category.iconName)}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{category.description || '-'}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-5 h-5 rounded-full border border-secondary"
                        style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                        title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                      />
                      <span className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded">
                        {convertFFToHex(category.colorCode)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {category.fallbackImages?.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Fallback ${index + 1}`}
                          className="w-8 h-8 object-cover rounded cursor-pointer border border-secondary hover:scale-110 transition-transform"
                          onClick={() => setSelectedImagePreview(image)}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Erstellt: {new Date(category.createdAt).toLocaleDateString()}
                      <br />
                      Aktualisiert: {new Date(category.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        className={cn(glassButton)}
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Löschen
                      </AnimatedButton>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
          {/* Desktop/Table Ansicht */}
          {isLoading ? (
            <JobCategoryTableSkeleton />
          ) : (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Card className={cn(glassCard, 'hidden md:block overflow-hidden')}>
                <Table>
                  <TableHeader>
                    <TableRow className="border-secondary hover:bg-muted/50">
                      <TableHead className="text-foreground font-semibold">Name</TableHead>
                      <TableHead className="text-foreground font-semibold">Icon</TableHead>
                      <TableHead className="text-foreground font-semibold">Beschreibung</TableHead>
                      <TableHead className="text-foreground font-semibold">Farbe</TableHead>
                      <TableHead className="text-foreground font-semibold">Erstellt am</TableHead>
                      <TableHead className="text-foreground font-semibold">Aktualisiert am</TableHead>
                      <TableHead className="text-foreground font-semibold">Fallback-Bilder</TableHead>
                      <TableHead className="w-[100px] text-foreground font-semibold">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow className="border-secondary hover:bg-muted/50">
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Keine Kategorien vorhanden
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map(category => (
                        <TableRow
                          key={category.id}
                          className="border-secondary hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                          <TableCell className="text-foreground">
                            {getIconComponent(category.iconName)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{category.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full border border-secondary hover:scale-150 transition-transform cursor-help"
                                style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                                title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                              />
                              <code className="text-xs bg-muted text-foreground px-1.5 py-0.5 rounded">
                                {convertFFToHex(category.colorCode)}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(category.updatedAt).toLocaleDateString()}
                          </TableCell>
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
                                    className="w-8 h-8 object-cover rounded border border-secondary hover:scale-110 transition-transform"
                                  />
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <AnimatedButton
                                  variant="ghost"
                                  className="h-8 w-8 p-0 rounded-lg"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </AnimatedButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className={cn(glassCard)}
                              >
                                <DropdownMenuItem
                                  onClick={() => handleEditCategory(category)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-destructive cursor-pointer"
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
              </Card>
            </motion.div>
          )}

          {/* Bildvorschau Dialog */}
          <Dialog
            open={!!selectedImagePreview}
            onOpenChange={open => !open && setSelectedImagePreview(null)}
          >
            <DialogContent className={cn(glassCard, 'max-w-4xl')}>
              <DialogHeader>
                <DialogTitle className="text-foreground">Bildvorschau</DialogTitle>
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
    </PageTransition>
  );
}
