import { useState, useEffect } from 'react';
import 'material-icons/iconfont/material-icons.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessCategory, BusinessCategoryCreation } from '@/models/business-category';
import { useBusinessCategoryService } from '@/services/businessCategoryService';
import { getIconComponent } from '@/utils/iconUtils';
import { IconPicker } from '@/components/ui/icon-picker';
import { KeywordSelector } from '@/components/ui/keyword-selector';
import { useNavigate } from 'react-router-dom';

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
      toast.success('Kategorie hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen der Kategorie');
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
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
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

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
      toast.success('Kategorie aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Kategorie');
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await businessCategoryService.deleteCategory(categoryId);
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
      iconName: '',
      keywordIds: [],
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
      loadCategories();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

      <div className="relative z-10 container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl border w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </div>

          {/* Header und Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Kategorien verwalten
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetModalState}
                  className="backdrop-blur-2xl bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 text-white hover:from-blue-600/90 hover:to-purple-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neue Kategorie
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white max-w-2xl">
                <DialogHeader className="border-b border-white/10 pb-4">
                  <DialogTitle className="text-white text-lg font-semibold">
                    {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Name</label>
                    <Input
                      value={newCategory.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      placeholder="Kategoriename"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Icon</label>
                    <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-xl p-3">
                      <IconPicker
                        value={newCategory.iconName}
                        onChange={value => setNewCategory({ ...newCategory, iconName: value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Beschreibung</label>
                    <Input
                      value={newCategory.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewCategory({ ...newCategory, description: e.target.value })
                      }
                      placeholder="Beschreibung"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Keywords</label>
                    <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-xl p-3">
                      <KeywordSelector
                        selectedIds={newCategory.keywordIds}
                        onChange={ids => setNewCategory({ ...newCategory, keywordIds: ids })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl order-2 sm:order-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Abbrechen
                    </Button>
                    <Button
                      onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                      className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-white/20 text-white hover:from-green-600/90 hover:to-emerald-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg order-1 sm:order-2"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile Card-Ansicht */}
        {isLoading ? (
          <div className="block md:hidden space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6"
              >
                {/* Header Section */}
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-6 w-32 bg-white/10 backdrop-blur-xl rounded flex-1" />
                  <Skeleton className="h-6 w-6 bg-white/10 backdrop-blur-xl rounded" />
                </div>

                {/* Description */}
                <Skeleton className="h-4 w-3/4 bg-white/10 backdrop-blur-xl rounded mb-3" />

                {/* Keywords Section */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton
                      key={j}
                      className="h-6 w-16 bg-white/10 backdrop-blur-xl rounded-xl"
                    />
                  ))}
                </div>

                {/* Dates Section */}
                <div className="mb-4 space-y-1">
                  <Skeleton className="h-3 w-24 bg-white/10 backdrop-blur-xl rounded" />
                  <Skeleton className="h-3 w-28 bg-white/10 backdrop-blur-xl rounded" />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Skeleton className="h-8 w-full sm:flex-1 bg-white/10 backdrop-blur-xl rounded-xl" />
                  <Skeleton className="h-8 w-full sm:flex-1 bg-white/10 backdrop-blur-xl rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="block md:hidden backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6 text-center">
            <div className="text-white/80">Keine Kategorien vorhanden</div>
          </div>
        ) : (
          <div className="block md:hidden space-y-4">
            {categories.map(category => (
              <div
                key={category.id}
                className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500 p-4 sm:p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="font-bold text-lg flex-1 text-white">{category.name}</div>
                  <div className="text-white/90">{getIconComponent(category.iconName)}</div>
                </div>
                <div className="text-sm text-white/80 mb-3">{category.description || '-'}</div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {category.keywords && category.keywords.length > 0 ? (
                    category.keywords.map(keyword => (
                      <span
                        key={keyword.name}
                        className="inline-flex items-center rounded-xl backdrop-blur-2xl bg-white/20 border border-white/30 px-2 py-1 text-xs font-medium text-white/90"
                      >
                        {keyword.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/60">Keine Keywords</span>
                  )}
                </div>
                <div className="text-xs text-white/60 mb-4 space-y-1">
                  <div>Erstellt: {new Date(category.createdAt).toLocaleDateString()}</div>
                  <div>Aktualisiert: {new Date(category.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl cursor-pointer flex-1"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="backdrop-blur-2xl bg-red-500/80 border-red-400/50 text-white hover:bg-red-600/90 hover:scale-105 transition-all duration-300 rounded-xl cursor-pointer flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop/Table Ansicht */}
        <div className="hidden md:block backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/90 font-semibold">Name</TableHead>
                <TableHead className="text-white/90 font-semibold">Icon</TableHead>
                <TableHead className="text-white/90 font-semibold">Beschreibung</TableHead>
                <TableHead className="text-white/90 font-semibold">Keywords</TableHead>
                <TableHead className="text-white/90 font-semibold">Erstellt am</TableHead>
                <TableHead className="text-white/90 font-semibold">Aktualisiert am</TableHead>
                <TableHead className="text-white/90 font-semibold w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-white/10 hover:bg-white/5">
                    {/* Name */}
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
                    </TableCell>
                    {/* Icon */}
                    <TableCell>
                      <Skeleton className="h-6 w-6 bg-white/10 backdrop-blur-xl rounded" />
                    </TableCell>
                    {/* Description */}
                    <TableCell>
                      <Skeleton className="h-4 w-32 bg-white/10 backdrop-blur-xl rounded" />
                    </TableCell>
                    {/* Keywords */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {[...Array(2)].map((_, j) => (
                          <Skeleton
                            key={j}
                            className="h-5 w-12 bg-white/10 backdrop-blur-xl rounded-xl"
                          />
                        ))}
                      </div>
                    </TableCell>
                    {/* Created At */}
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-white/10 backdrop-blur-xl rounded" />
                    </TableCell>
                    {/* Updated At */}
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-white/10 backdrop-blur-xl rounded" />
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <Skeleton className="h-8 w-8 bg-white/10 backdrop-blur-xl rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={7} className="text-center text-white/80 py-8">
                    Keine Kategorien vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                categories.map(category => (
                  <TableRow
                    key={category.id}
                    className="border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-medium text-white">{category.name}</TableCell>
                    <TableCell className="text-white/90">
                      {getIconComponent(category.iconName)}
                    </TableCell>
                    <TableCell className="text-white/80">{category.description || '-'}</TableCell>
                    <TableCell>
                      {category.keywords && category.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {category.keywords.map(keyword => (
                            <span
                              key={keyword.name}
                              className="inline-flex items-center rounded-xl backdrop-blur-2xl bg-white/20 border border-white/30 px-2 py-1 text-xs font-medium text-white/90"
                            >
                              {keyword.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/60">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="backdrop-blur-3xl bg-white/10 border-white/20 text-white"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEditCategory(category)}
                            className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-300 hover:text-red-200 hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer"
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
      </div>
    </div>
  );
}
