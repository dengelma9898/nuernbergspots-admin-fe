import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, MoreHorizontal, Pencil, Trash2, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getIconComponent } from '@/utils/iconUtils';
import { IconPicker } from '@/components/ui/icon-picker';
import { KeywordSelector } from '@/components/ui/keyword-selector';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

import { useCategoryList } from '@/hooks/useCategoryList';
import { CategoryListCard } from '@/components/categories/CategoryListCards';
import {
  CategoryListMobileSkeletons,
  CategoryListTableSkeletonWrapper,
} from '@/components/categories/CategoryListSkeletons';

export type CategoryListContentProps = ReturnType<typeof useCategoryList>;

export function CategoryListContent({
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
}: CategoryListContentProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <motion.div
          className={listSectionPreset}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex flex-row items-center gap-4">
              <LoadingButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className={cn(buttonPreset, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </LoadingButton>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Kategorien verwalten
              </h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <LoadingButton
                  onClick={resetModalState}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neue Kategorie
                </LoadingButton>
              </DialogTrigger>
              <DialogContent className={cn(cardPreset, 'max-w-2xl')}>
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
                  {validationErrors.length > 0 && (
                    <Alert
                      variant="destructive"
                      className={cn(cardPreset, 'border-destructive/50')}
                    >
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
                        if (validationErrors.length > 0) {
                          setValidationErrors([]);
                        }
                      }}
                      placeholder="Kategoriename"
                      className={cn(inputPreset)}
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
                    <div className={cn(cardPreset, 'p-3')}>
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
                      className={cn(inputPreset)}
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
                    <div className={cn(cardPreset, 'p-3')}>
                      <KeywordSelector
                        selectedIds={newCategory.keywordIds}
                        onChange={ids => setNewCategory({ ...newCategory, keywordIds: ids })}
                      />
                    </div>
                  </motion.div>
                </div>
                <DialogFooter>
                  <LoadingButton
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0"
                  >
                    Abbrechen
                  </LoadingButton>
                  <LoadingButton
                    variant="outline"
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    isLoading={false}
                    className={cn(buttonPreset)}
                  >
                    <Check className="h-4 w-4" />
                    {editingCategory ? 'Aktualisieren' : 'Hinzufügen'}
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {isLoading ? (
          <CategoryListMobileSkeletons />
        ) : categories.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset, 'block md:hidden p-6 text-center')}>
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
            {categories.map(category => (
              <motion.div key={category.id} variants={fadeInUp}>
                <CategoryListCard
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          className="hidden md:block"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.2 }}
        >
          {isLoading ? (
            <CategoryListTableSkeletonWrapper />
          ) : (
            <Card className={cn(cardPreset, 'overflow-hidden')}>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow className="border-secondary hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Icon</TableHead>
                    <TableHead className="text-foreground font-semibold">Beschreibung</TableHead>
                    <TableHead className="text-foreground font-semibold">Keywords</TableHead>
                    <TableHead className="text-foreground font-semibold">Erstellt am</TableHead>
                    <TableHead className="text-foreground font-semibold">Aktualisiert am</TableHead>
                    <TableHead className="text-foreground font-semibold w-[100px]">
                      Aktionen
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow className="border-secondary hover:bg-muted/50">
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Keine Kategorien vorhanden
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map(category => (
                      <TableRow
                        key={category.id}
                        className="border-secondary hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getIconComponent(category.iconName)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell>
                          {category.keywords && category.keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {category.keywords.map(keyword => (
                                <Badge key={keyword.name} variant="outline" className="text-xs">
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
                              <LoadingButton variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </LoadingButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={cn(cardPreset)}>
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
          )}
        </motion.div>
      </div>
    </div>
  );
}
