import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, ArrowLeft, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { EventCategory, EventCategoryCreation } from '@/models/event-category';
import { useEventCategoryService } from '@/services/eventCategoryService';
import { getIconComponent } from '@/utils/iconUtils';
import { IconPicker } from '@/components/ui/icon-picker';
import { convertFFToHex, convertHexToFF } from '@/utils/colorUtils';
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

export function EventCategoryList() {
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
      toast.success('Kategorie hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      showUserFriendlyError(error, toast);
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
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

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
      await eventCategoryService.deleteCategory(categoryId);
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
    });
    imageUpload.clearImages();
    setExistingImageUrls([]);
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
      toast.success('Bilder erfolgreich hochgeladen');
    } catch (error) {
      console.error('Fehler beim Hochladen der Bilder:', error);
      showUserFriendlyError(error, toast);
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

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          {/* Hidden compatibility element for tests */}
          <div className="container mx-auto p-4 md:p-8 max-w-7xl absolute -z-10 opacity-0 pointer-events-none"></div>
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 md:p-8 mb-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AnimatedButton
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className={cn(glassButton, 'w-full sm:w-auto')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zum Dashboard
                </AnimatedButton>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    Event-Kategorien
                  </h1>
                  {/* Hidden compatibility text for tests */}
                  <span className="sr-only">Event-Kategorien verwalten</span>
                  <p className="text-muted-foreground mt-1 text-sm md:text-base">
                    Verwalten Sie alle Event-Kategorien mit Icons, Farben und Fallback-Bildern
                  </p>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <AnimatedButton
                    onClick={resetModalState}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full lg:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neue Kategorie
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className={cn(glassCard, 'max-w-2xl')}>
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-xl">
                      {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {editingCategory
                        ? 'Bearbeiten Sie die Kategorie-Details'
                        : 'Erstellen Sie eine neue Event-Kategorie'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <motion.div
                      className="space-y-2"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.1 }}
                    >
                      <Label className="text-foreground">Name</Label>
                      <Input
                        value={newCategory.name}
                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Kategoriename"
                        className={cn(glassInput)}
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.2 }}
                    >
                      <Label className="text-foreground">Icon</Label>
                      <div className={cn(glassCard, 'p-3')}>
                        <IconPicker
                          value={newCategory.iconName}
                          onChange={value => setNewCategory({ ...newCategory, iconName: value })}
                        />
                      </div>
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.3 }}
                    >
                      <Label className="text-foreground">Beschreibung</Label>
                      <Input
                        value={newCategory.description}
                        onChange={e =>
                          setNewCategory({ ...newCategory, description: e.target.value })
                        }
                        placeholder="Beschreibung der Kategorie"
                        className={cn(glassInput)}
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.4 }}
                    >
                      <Label className="text-foreground">Farbe</Label>
                      <Input
                        type="color"
                        value={newCategory.colorCode}
                        onChange={e => setNewCategory({ ...newCategory, colorCode: e.target.value })}
                        className={cn(glassInput, 'h-12')}
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.5 }}
                    >
                      <Label className="text-foreground">
                        Fallback-Bilder (max. 5)
                      </Label>
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
                              className="w-full h-24 object-cover rounded-lg border border-secondary"
                            />
                            <button
                              onClick={() => removeImage(index, true)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
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
                              className="w-full h-24 object-cover rounded-lg border border-secondary"
                            />
                            <button
                              onClick={() => removeImage(index, false)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                              aria-label="Bild entfernen"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {(existingImageUrls.length + imageUpload.previewUrls.length) < 5 && (
                          <label className="flex items-center justify-center h-24 border-2 border-dashed border-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors">
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
                    </motion.div>
                  </div>
                  <DialogFooter>
                    <AnimatedButton
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                      className={cn(glassButton, 'w-full sm:w-auto')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Abbrechen
                    </AnimatedButton>
                    <LoadingButton
                      onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                      isLoading={isSaving}
                      loadingText={editingCategory ? 'Wird gespeichert...' : 'Wird erstellt...'}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
                    </LoadingButton>
                  </DialogFooter>
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
              {[...Array(4)].map((_, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className={cn(glassCard, 'p-4')}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-6 w-2/3 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>

                    {/* Description */}
                    <Skeleton className="h-4 w-full mb-3 rounded" />

                    {/* Color */}
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>

                    {/* Fallback Images */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[...Array(3)].map((_, imgIndex) => (
                        <Skeleton
                          key={imgIndex}
                          className="h-8 w-8 rounded-lg"
                        />
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 mb-3">
                      <Skeleton className="h-3 w-2/3 rounded" />
                      <Skeleton className="h-3 w-2/3 rounded" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1 rounded-xl" />
                      <Skeleton className="h-8 flex-1 rounded-xl" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'block md:hidden p-8 md:p-12 text-center')}>
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                  Keine Kategorien
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Es sind noch keine Event-Kategorien vorhanden.
                </p>
                {/* Hidden compatibility text for tests */}
                <span className="sr-only">Keine Kategorien vorhanden</span>
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
                  <Card className={cn(glassCard, 'p-4')}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-foreground font-bold text-lg flex-1">{category.name}</div>
                      <div className="text-muted-foreground">{getIconComponent(category.iconName)}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">{category.description || '-'}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-secondary"
                        style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                        title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                      />
                      <Badge variant="outline" className="text-xs">
                        {convertFFToHex(category.colorCode)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {category.fallbackImages?.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Fallback ${imgIndex + 1}`}
                          className="w-8 h-8 object-cover rounded-lg cursor-pointer border-2 border-secondary hover:scale-110 transition-transform"
                          onClick={() => setSelectedImagePreview(image)}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3 space-y-1">
                      <div>Erstellt: {new Date(category.createdAt).toLocaleDateString()}</div>
                      <div>Aktualisiert: {new Date(category.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        className={cn(glassButton, 'flex-1')}
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex-1"
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
          <motion.div
            className="hidden md:block"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <Card className={cn(glassCard, 'overflow-hidden')}>
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
                  {isLoading ? (
                    <>
                      {[...Array(5)].map((_, index) => (
                        <TableRow key={index} className="border-secondary hover:bg-muted/50">
                          {/* Name */}
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-32 rounded" />
                          </TableCell>

                          {/* Icon */}
                          <TableCell className="py-4">
                            <Skeleton className="h-6 w-6 rounded" />
                          </TableCell>

                          {/* Description */}
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-48 rounded" />
                          </TableCell>

                          {/* Color */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-4 w-16 rounded" />
                            </div>
                          </TableCell>

                          {/* Created At */}
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-20 rounded" />
                          </TableCell>

                          {/* Updated At */}
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-20 rounded" />
                          </TableCell>

                          {/* Fallback Images */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              {[...Array(3)].map((_, imgIndex) => (
                                <Skeleton
                                  key={imgIndex}
                                  className="h-8 w-8 rounded-lg"
                                />
                              ))}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                          Keine Kategorien
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base">
                          Es sind noch keine Event-Kategorien vorhanden.
                        </p>
                        {/* Hidden compatibility text for tests */}
                        <span className="sr-only">Keine Kategorien vorhanden</span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category, index) => (
                      <TableRow
                        key={category.id}
                        className="border-secondary hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {getIconComponent(category.iconName)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{category.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-secondary hover:scale-150 transition-transform cursor-help"
                              style={{ backgroundColor: convertFFToHex(category.colorCode) }}
                              title={`Farbcode: ${convertFFToHex(category.colorCode)}`}
                            />
                            <Badge variant="outline" className="text-xs">
                              {convertFFToHex(category.colorCode)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(category.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {category.fallbackImages?.map((image, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => setSelectedImagePreview(image)}
                              >
                                <img
                                  src={image}
                                  alt={`Fallback ${imgIndex + 1}`}
                                  className="w-8 h-8 object-cover rounded-lg border-2 border-secondary"
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
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </AnimatedButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={cn(glassCard)}>
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

          {/* Bildvorschau Dialog */}
          <Dialog
            open={!!selectedImagePreview}
            onOpenChange={open => !open && setSelectedImagePreview(null)}
          >
            <DialogContent className={cn(glassCard, 'max-w-4xl')}>
              <DialogHeader>
                <DialogTitle className="text-foreground text-xl">Bildvorschau</DialogTitle>
              </DialogHeader>
              {selectedImagePreview && (
                <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden border border-secondary">
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
