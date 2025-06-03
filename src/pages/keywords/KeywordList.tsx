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
  X,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Keyword } from '@/models/keyword';
import { useKeywordService } from '@/services/keywordService';
import { useNavigate } from 'react-router-dom';

export function KeywordList() {
  const keywordService = useKeywordService();
  const navigate = useNavigate();
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
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      {/* Back Button */}
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
      </div>
      {/* Header und Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Keywords verwalten</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={resetModalState}>
              <Plus className="mr-2 h-4 w-4" />
              Neues Keyword
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
      </div>

      {/* Mobile Card-Ansicht */}
      {isLoading ? (
        <div className="block md:hidden text-center text-muted-foreground">Lade Keywords...</div>
      ) : keywords.length === 0 ? (
        <div className="block md:hidden text-center text-muted-foreground">Keine Keywords vorhanden</div>
      ) : (
        <div className="block md:hidden space-y-4">
          {keywords.map((keyword) => (
            <Card key={keyword.id} className="p-4">
              <div className="font-bold text-lg mb-1">{keyword.name}</div>
              <div className="text-sm text-muted-foreground mb-2">{keyword.description || '-'}</div>
              <div className="text-xs text-muted-foreground mb-2">
                Erstellt: {new Date(keyword.createdAt).toLocaleDateString()}<br />
                Aktualisiert: {new Date(keyword.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => handleEditKeyword(keyword)} className="cursor-pointer">
                  <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteKeyword(keyword.id)} className="cursor-pointer">
                  <Trash2 className="mr-1 h-4 w-4" /> Löschen
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Desktop/Table Ansicht */}
      <Table className="hidden md:table">
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
    </div>
  );
} 