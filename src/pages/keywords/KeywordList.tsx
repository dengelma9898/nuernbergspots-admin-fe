import { useState, useEffect } from 'react';
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
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { Keyword } from '@/models/keyword';
import { useKeywordService } from '@/services/keywordService';
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

export function KeywordList() {
  const keywordService = useKeywordService();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [newKeyword, setNewKeyword] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      setIsLoading(true);
      const data = await keywordService.getKeywords();
      setKeywords(data);
    } catch (error) {
      console.error('Fehler beim Laden der Keywords:', error);
      showUserFriendlyError(error, toast, () => loadKeywords(), 'load-keywords');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.name.trim()) {
      setValidationErrors(['Bitte geben Sie einen Namen ein']);
      return;
    }
    
    setValidationErrors([]);

    try {
      const keyword = await keywordService.createKeyword({
        name: newKeyword.name.trim(),
        description: newKeyword.description.trim(),
      });
      setKeywords([...keywords, keyword]);
      setNewKeyword({ name: '', description: '' });
      setIsDialogOpen(false);
      setValidationErrors([]);
      showSuccessMessage(toast, {
        title: 'Keyword hinzugefügt',
        description: `"${keyword.name}" wurde erfolgreich hinzugefügt.`,
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Keywords:', error);
      showUserFriendlyError(error, toast, () => handleAddKeyword(), 'save-keyword');
    }
  };

  const handleEditKeyword = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setNewKeyword({
      name: keyword.name,
      description: keyword.description,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateKeyword = async () => {
    if (!editingKeyword || !newKeyword.name.trim()) {
      setValidationErrors(['Bitte geben Sie einen Namen ein']);
      return;
    }
    
    setValidationErrors([]);

    try {
      const updatedKeyword = await keywordService.updateKeyword(editingKeyword.id, {
        name: newKeyword.name.trim(),
        description: newKeyword.description.trim(),
      });
      setKeywords(keywords.map(kw => (kw.id === editingKeyword.id ? updatedKeyword : kw)));
      setEditingKeyword(null);
      setNewKeyword({ name: '', description: '' });
      setIsDialogOpen(false);
      setValidationErrors([]);
      showSuccessMessage(toast, {
        title: 'Keyword aktualisiert',
        description: `"${updatedKeyword.name}" wurde erfolgreich aktualisiert.`,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Keywords:', error);
      showUserFriendlyError(error, toast, () => handleUpdateKeyword(), 'save-keyword');
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      const keywordToDelete = keywords.find(kw => kw.id === keywordId);
      await keywordService.deleteKeyword(keywordId);
      setKeywords(keywords.filter(kw => kw.id !== keywordId));
      showSuccessMessage(toast, {
        title: 'Keyword gelöscht',
        description: keywordToDelete ? `"${keywordToDelete.name}" wurde erfolgreich gelöscht.` : 'Das Keyword wurde erfolgreich gelöscht.',
      });
    } catch (error) {
      console.error('Fehler beim Löschen des Keywords:', error);
      showUserFriendlyError(error, toast, undefined, 'delete-keyword');
    }
  };

  const resetModalState = () => {
    setEditingKeyword(null);
    setNewKeyword({ name: '', description: '' });
    setValidationErrors([]);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
      loadKeywords();
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
                Keywords verwalten
              </h1>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <AnimatedButton
                    onClick={resetModalState}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neues Keyword
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className={cn(glassCard, 'max-w-2xl')}>
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      {editingKeyword ? 'Keyword bearbeiten' : 'Neues Keyword'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {editingKeyword
                        ? 'Bearbeiten Sie das Keyword'
                        : 'Erstellen Sie ein neues Keyword'}
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
                        value={newKeyword.name}
                        onChange={e => {
                          setNewKeyword({ ...newKeyword, name: e.target.value });
                          // Fehler zurücksetzen, wenn Wert geändert wird
                          if (validationErrors.length > 0) {
                            setValidationErrors([]);
                          }
                        }}
                        placeholder="Keyword Name"
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
                      <Label className="text-foreground">Beschreibung</Label>
                      <Input
                        value={newKeyword.description}
                        onChange={e => setNewKeyword({ ...newKeyword, description: e.target.value })}
                        placeholder="Beschreibung"
                        className={cn(glassInput)}
                      />
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
                      onClick={editingKeyword ? handleUpdateKeyword : handleAddKeyword}
                      isLoading={false}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {editingKeyword ? 'Aktualisieren' : 'Hinzufügen'}
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
                  <Card className={cn(glassCard, 'p-4 sm:p-6')}>
                    {/* Header */}
                    <Skeleton className="h-6 w-3/4 mb-2 rounded" />

                    {/* Description */}
                    <Skeleton className="h-4 w-full mb-3 rounded" />

                    {/* Dates */}
                    <div className="space-y-1 mb-4">
                      <Skeleton className="h-3 w-1/2 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
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
          ) : keywords.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'block md:hidden p-6 text-center')}>
                <div className="text-muted-foreground">Keine Keywords vorhanden</div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="block md:hidden space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {keywords.map((keyword, index) => (
                <motion.div key={keyword.id} variants={fadeInUp}>
                  <Card className={cn(glassCard, 'p-4 sm:p-6')}>
                    <div className="font-bold text-lg mb-2 text-foreground">{keyword.name}</div>
                    <div className="text-sm text-muted-foreground mb-3">{keyword.description || '-'}</div>
                    <div className="text-xs text-muted-foreground mb-4 space-y-1">
                      <div>Erstellt: {new Date(keyword.createdAt).toLocaleDateString()}</div>
                      <div>Aktualisiert: {new Date(keyword.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditKeyword(keyword)}
                        className={cn(glassButton, 'flex-1')}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
                      </AnimatedButton>
                      <AnimatedButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteKeyword(keyword.id)}
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
              <Table>
                <TableHeader>
                  <TableRow className="border-secondary hover:bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Beschreibung</TableHead>
                    <TableHead className="text-foreground font-semibold">Erstellt am</TableHead>
                    <TableHead className="text-foreground font-semibold">Aktualisiert am</TableHead>
                    <TableHead className="text-foreground font-semibold w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      {[...Array(5)].map((_, index) => (
                        <TableRow key={index} className="border-secondary hover:bg-muted/50">
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-24 rounded" />
                          </TableCell>
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-48 rounded" />
                          </TableCell>
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-20 rounded" />
                          </TableCell>
                          <TableCell className="py-4">
                            <Skeleton className="h-4 w-20 rounded" />
                          </TableCell>
                          <TableCell className="py-4">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : keywords.length === 0 ? (
                    <TableRow className="border-secondary hover:bg-muted/50">
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Keine Keywords vorhanden
                      </TableCell>
                    </TableRow>
                  ) : (
                    keywords.map((keyword, index) => (
                      <TableRow
                        key={keyword.id}
                        className="border-secondary hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">{keyword.name}</TableCell>
                        <TableCell className="text-muted-foreground">{keyword.description || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(keyword.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(keyword.updatedAt).toLocaleDateString()}
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
                                onClick={() => handleEditKeyword(keyword)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteKeyword(keyword.id)}
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
