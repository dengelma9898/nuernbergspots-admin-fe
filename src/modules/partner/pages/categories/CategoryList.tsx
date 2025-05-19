import { useState, useEffect } from 'react';
import 'material-icons/iconfont/material-icons.css';
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
  ArrowLeft
} from 'lucide-react';
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
    keywordIds: []
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
        iconName: toSnakeCase(newCategory.iconName)
      };
      const category = await businessCategoryService.createCategory(categoryToSave);
      setCategories([...categories, category]);
      setNewCategory({
        name: '',
        description: '',
        iconName: '',
        keywordIds: []
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
      keywordIds: category.keywords?.map(k => k.id) || []
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
        iconName: toSnakeCase(newCategory.iconName)
      };
      const updatedCategory = await businessCategoryService.updateCategory(editingCategory.id, categoryToUpdate);
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      ));
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
      keywordIds: []
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
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Kategorien verwalten</h1>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kategorien verwalten</CardTitle>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory({ ...newCategory, name: e.target.value })}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Beschreibung"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keywords</label>
                  <KeywordSelector
                    selectedIds={newCategory.keywordIds}
                    onChange={(ids) => setNewCategory({ ...newCategory, keywordIds: ids })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                  <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                    <Check className="mr-2 h-4 w-4" />
                    {editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
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
                <TableHead>Keywords</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead>Aktualisiert am</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Lade Kategorien...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                      {category.keywords && category.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {category.keywords.map((keyword) => (
                            <span 
                              key={keyword.name} 
                              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                            >
                              {keyword.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
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
    </div>
  );
} 