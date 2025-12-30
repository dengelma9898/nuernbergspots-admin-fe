import { useState, useEffect } from 'react';
import 'material-icons/iconfont/material-icons.css';
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
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { BusinessCategory, BusinessCategoryCreation } from '@/models/business-category';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { getIconComponent } from '@/utils/iconUtils';
import { IconPicker } from '@/components/ui/icon-picker';
import { KeywordSelector } from '@/components/ui/keyword-selector';
import { useNavigate } from 'react-router-dom';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const toSnakeCase = (str: string): string => {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export function CategoryList() {
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
      showUserFriendlyError(error, toast);
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
      showUserFriendlyError(error, toast);
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
      showUserFriendlyError(error, toast);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await businessCategoryService.deleteCategory(categoryId);
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

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            {/* Back Button */}
            <div className="mb-4">
              <AnimatedButton
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className={cn(glassButton, 'w-full sm:w-auto')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Dashboard
              </AnimatedButton>
            </div>

            {/* Header und Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Kategorien verwalten
              </h1>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <AnimatedButton
                    onClick={resetModalState}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
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
                    <DialogDescription className="text-muted-foreground">
                      {editingCategory
                        ? 'Bearbeiten Sie die Kategorie-Details'
                        : 'Erstellen Sie eine neue Kategorie'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Validierungsfehler */}
                    {validationErrors.length > 0 && (
                      <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
                        <AlertDescription className="mt-2">
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setNewCategory({ ...newCategory, name: e.target.value });
                          // Fehler zurücksetzen, wenn Wert geändert wird
                          if (validationErrors.length > 0) {
                            setValidationErrors([]);
                          }
                        }}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewCategory({ ...newCategory, description: e.target.value })
                        }
                        placeholder="Beschreibung"
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
                      <Label className="text-foreground">Keywords</Label>
                      <div className={cn(glassCard, 'p-3')}>
                        <KeywordSelector
                          selectedIds={newCategory.keywordIds}
                          onChange={ids => setNewCategory({ ...newCategory, keywordIds: ids })}
                        />
                      </div>
                    </motion.div>
                  </div>
                  <DialogFooter>
                    <AnimatedButton
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className={cn(glassButton)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Abbrechen
                    </AnimatedButton>
                    <LoadingButton
                      onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                      isLoading={false}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
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
              {[...Array(4)].map((_, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card className={cn(glassCard, 'p-4 sm:p-6')}>
                    {/* Header Section */}
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-6 w-32 rounded flex-1" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>

                    {/* Description */}
                    <Skeleton className="h-4 w-3/4 rounded mb-3" />

                    {/* Keywords Section */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton
                          key={j}
                          className="h-6 w-16 rounded-xl"
                        />
                      ))}
                    </div>

                    {/* Dates Section */}
                    <div className="mb-4 space-y-1">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Skeleton className="h-8 w-full sm:flex-1 rounded-xl" />
                      <Skeleton className="h-8 w-full sm:flex-1 rounded-xl" />
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
              <Card className={cn(glassCard, 'block md:hidden p-6 text-center')}>
                <div className="text-muted-foreground">Keine Kategorien vorhanden</div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="block md:hidden space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {categories.map((category) => (
                <motion.div key={category.id} variants={fadeInUp}>
                  <Card className={cn(glassCard, 'p-4 sm:p-6')}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="font-bold text-lg flex-1 text-foreground">{category.name}</div>
                      <div className="text-muted-foreground">{getIconComponent(category.iconName)}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">{category.description || '-'}</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {category.keywords && category.keywords.length > 0 ? (
                        category.keywords.map(keyword => (
                          <Badge
                            key={keyword.name}
                            variant="outline"
                            className="text-xs"
                          >
                            {keyword.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Keine Keywords</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-4 space-y-1">
                      <div>Erstellt: {new Date(category.createdAt).toLocaleDateString()}</div>
                      <div>Aktualisiert: {new Date(category.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        className={cn(glassButton, 'flex-1')}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex-1"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Löschen
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
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow className="border-secondary hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Icon</TableHead>
                    <TableHead className="text-foreground font-semibold">Beschreibung</TableHead>
                    <TableHead className="text-foreground font-semibold">Keywords</TableHead>
                    <TableHead className="text-foreground font-semibold">Erstellt am</TableHead>
                    <TableHead className="text-foreground font-semibold">Aktualisiert am</TableHead>
                    <TableHead className="text-foreground font-semibold w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i} className="border-secondary hover:bg-muted/50">
                        {/* Name */}
                        <TableCell>
                          <Skeleton className="h-4 w-24 rounded" />
                        </TableCell>
                        {/* Icon */}
                        <TableCell>
                          <Skeleton className="h-6 w-6 rounded" />
                        </TableCell>
                        {/* Description */}
                        <TableCell>
                          <Skeleton className="h-4 w-32 rounded" />
                        </TableCell>
                        {/* Keywords */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {[...Array(2)].map((_, j) => (
                              <Skeleton
                                key={j}
                                className="h-5 w-12 rounded-xl"
                              />
                            ))}
                          </div>
                        </TableCell>
                        {/* Created At */}
                        <TableCell>
                          <Skeleton className="h-4 w-20 rounded" />
                        </TableCell>
                        {/* Updated At */}
                        <TableCell>
                          <Skeleton className="h-4 w-20 rounded" />
                        </TableCell>
                        {/* Actions */}
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : categories.length === 0 ? (
                    <TableRow className="border-secondary hover:bg-muted/50">
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Keine Kategorien vorhanden
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
                          {category.keywords && category.keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {category.keywords.map(keyword => (
                                <Badge
                                  key={keyword.name}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {keyword.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(category.updatedAt).toLocaleDateString()}
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
        </div>
      </div>
    </PageTransition>
  );
}
