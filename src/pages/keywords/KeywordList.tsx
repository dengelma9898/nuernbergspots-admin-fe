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
              Keywords verwalten
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetModalState}
                  className="backdrop-blur-2xl bg-gradient-to-r from-blue-500/80 to-purple-500/80 border border-white/20 text-white hover:from-blue-600/90 hover:to-purple-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Keyword
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white max-w-2xl">
                <DialogHeader className="border-b border-white/10 pb-4">
                  <DialogTitle className="text-white text-lg font-semibold">
                    {editingKeyword ? 'Keyword bearbeiten' : 'Neues Keyword'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Name</label>
                    <Input
                      value={newKeyword.name}
                      onChange={(e) => setNewKeyword({ ...newKeyword, name: e.target.value })}
                      placeholder="Keyword Name"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Beschreibung</label>
                    <Input
                      value={newKeyword.description}
                      onChange={(e) => setNewKeyword({ ...newKeyword, description: e.target.value })}
                      placeholder="Beschreibung"
                      className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/15 focus:bg-white/20 transition-all duration-300 rounded-xl"
                    />
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
                      onClick={editingKeyword ? handleUpdateKeyword : handleAddKeyword}
                      className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-white/20 text-white hover:from-green-600/90 hover:to-emerald-600/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg order-1 sm:order-2"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {editingKeyword ? 'Aktualisieren' : 'Hinzufügen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile Card-Ansicht */}
        {isLoading ? (
          <div className="block md:hidden backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6 text-center">
            <div className="text-white/80">Lade Keywords...</div>
          </div>
        ) : keywords.length === 0 ? (
          <div className="block md:hidden backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6 text-center">
            <div className="text-white/80">Keine Keywords vorhanden</div>
          </div>
        ) : (
          <div className="block md:hidden space-y-4">
            {keywords.map((keyword) => (
              <div key={keyword.id} className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500 p-4 sm:p-6">
                <div className="font-bold text-lg mb-2 text-white">{keyword.name}</div>
                <div className="text-sm text-white/80 mb-3">{keyword.description || '-'}</div>
                <div className="text-xs text-white/60 mb-4 space-y-1">
                  <div>Erstellt: {new Date(keyword.createdAt).toLocaleDateString()}</div>
                  <div>Aktualisiert: {new Date(keyword.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditKeyword(keyword)} 
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl cursor-pointer flex-1"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeleteKeyword(keyword.id)} 
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
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/90 font-semibold">Name</TableHead>
                <TableHead className="text-white/90 font-semibold">Beschreibung</TableHead>
                <TableHead className="text-white/90 font-semibold">Erstellt am</TableHead>
                <TableHead className="text-white/90 font-semibold">Aktualisiert am</TableHead>
                <TableHead className="text-white/90 font-semibold w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={5} className="text-center text-white/80 py-8">
                    Lade Keywords...
                  </TableCell>
                </TableRow>
              ) : keywords.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={5} className="text-center text-white/80 py-8">
                    Keine Keywords vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                keywords.map((keyword) => (
                  <TableRow key={keyword.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-white">{keyword.name}</TableCell>
                    <TableCell className="text-white/80">{keyword.description || '-'}</TableCell>
                    <TableCell className="text-white/70">{new Date(keyword.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white/70">{new Date(keyword.updatedAt).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuContent align="end" className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                          <DropdownMenuItem 
                            onClick={() => handleEditKeyword(keyword)}
                            className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteKeyword(keyword.id)}
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