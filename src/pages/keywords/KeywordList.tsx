import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Keyword } from '@/models/keyword';
import { useKeywordService } from '@/services/keywordService';

export function KeywordList() {
  const keywordService = useKeywordService();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [newKeyword, setNewKeyword] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      setIsLoading(true);
      const data = await keywordService.getKeywords();
      setKeywords(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Keywords');
      console.error('Fehler beim Laden der Keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    try {
      const keyword = await keywordService.createKeyword({ 
        name: newKeyword.name.trim(),
        description: newKeyword.description.trim()
      });
      setKeywords([...keywords, keyword]);
      setNewKeyword({ name: '', description: '' });
      setIsDialogOpen(false);
      toast.success('Keyword hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Keywords');
      console.error('Fehler beim Hinzufügen des Keywords:', error);
    }
  };

  const handleEditKeyword = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setNewKeyword({
      name: keyword.name,
      description: keyword.description
    });
    setIsDialogOpen(true);
  };

  const handleUpdateKeyword = async () => {
    if (!editingKeyword || !newKeyword.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    try {
      const updatedKeyword = await keywordService.updateKeyword(editingKeyword.id, { 
        name: newKeyword.name.trim(),
        description: newKeyword.description.trim()
      });
      setKeywords(keywords.map(kw => 
        kw.id === editingKeyword.id ? updatedKeyword : kw
      ));
      setEditingKeyword(null);
      setNewKeyword({ name: '', description: '' });
      setIsDialogOpen(false);
      toast.success('Keyword aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Keywords');
      console.error('Fehler beim Aktualisieren des Keywords:', error);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await keywordService.deleteKeyword(keywordId);
      setKeywords(keywords.filter(kw => kw.id !== keywordId));
      toast.success('Keyword gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen des Keywords');
      console.error('Fehler beim Löschen des Keywords:', error);
    }
  };

  const resetModalState = () => {
    setEditingKeyword(null);
    setNewKeyword({ name: '', description: '' });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetModalState();
      loadKeywords();
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Keywords verwalten</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button onClick={resetModalState}>
                <Plus className="mr-2 h-4 w-4" />
                Neues Keyword
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingKeyword ? 'Keyword bearbeiten' : 'Neues Keyword'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newKeyword.name}
                    onChange={(e) => setNewKeyword({ ...newKeyword, name: e.target.value })}
                    placeholder="Keyword Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Input
                    value={newKeyword.description}
                    onChange={(e) => setNewKeyword({ ...newKeyword, description: e.target.value })}
                    placeholder="Beschreibung"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                  <Button onClick={editingKeyword ? handleUpdateKeyword : handleAddKeyword}>
                    <Check className="mr-2 h-4 w-4" />
                    {editingKeyword ? 'Aktualisieren' : 'Hinzufügen'}
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
                <TableHead>Beschreibung</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead>Aktualisiert am</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Lade Keywords...
                  </TableCell>
                </TableRow>
              ) : keywords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Keine Keywords vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                keywords.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell className="font-medium">{keyword.name}</TableCell>
                    <TableCell>{keyword.description || '-'}</TableCell>
                    <TableCell>{new Date(keyword.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(keyword.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditKeyword(keyword)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteKeyword(keyword.id)}
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