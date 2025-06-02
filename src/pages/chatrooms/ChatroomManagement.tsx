import React, { useEffect, useState } from 'react';
import { useChatroomService } from '@/services/chatroomService';
import { Chatroom } from '@/models/chatroom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, MessageCircle, Users, Trash2, Edit2, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ChatroomManagement() {
  const chatroomService = useChatroomService();
  const navigate = useNavigate();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newChatroom, setNewChatroom] = useState({
    title: '',
    description: '',
    imageUrl: '',
    participants: [] as string[]
  });

  useEffect(() => {
    loadChatrooms();
  }, []);

  const loadChatrooms = async () => {
    try {
      setIsLoading(true);
      const data = await chatroomService.getChatrooms();
      setChatrooms(data);
    } catch (error) {
      toast.error("Chatrooms konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateChatroom = async () => {
    try {
      const createdChatroom = await chatroomService.createChatroom(newChatroom);
      
      if (selectedImage) {
        const imageUrl = await chatroomService.uploadChatroomImage(createdChatroom.id, selectedImage);
        await chatroomService.updateChatroom(createdChatroom.id, { imageUrl });
      }

      toast.success("Chatroom wurde erfolgreich erstellt.");
      setIsCreateDialogOpen(false);
      setNewChatroom({
        title: '',
        description: '',
        imageUrl: '',
        participants: []
      });
      setSelectedImage(null);
      setImagePreview(null);
      loadChatrooms();
    } catch (error) {
      toast.error("Chatroom konnte nicht erstellt werden.");
    }
  };

  const handleEditChatroom = async () => {
    if (!selectedChatroom) return;

    try {
      const updatedChatroom = await chatroomService.updateChatroom(selectedChatroom.id, {
        title: selectedChatroom.title,
        description: selectedChatroom.description,
      });

      if (selectedImage) {
        const imageUrl = await chatroomService.uploadChatroomImage(selectedChatroom.id, selectedImage);
        await chatroomService.updateChatroom(selectedChatroom.id, { imageUrl });
      }

      toast.success("Chatroom wurde erfolgreich aktualisiert.");
      setIsEditDialogOpen(false);
      setSelectedChatroom(null);
      setSelectedImage(null);
      setImagePreview(null);
      loadChatrooms();
    } catch (error) {
      toast.error("Chatroom konnte nicht aktualisiert werden.");
    }
  };

  const handleDeleteChatroom = async () => {
    if (!selectedChatroom) return;

    try {
      await chatroomService.deleteChatroom(selectedChatroom.id);
      toast.success("Chatroom wurde erfolgreich gelöscht.");
      setIsDeleteDialogOpen(false);
      setSelectedChatroom(null);
      loadChatrooms();
    } catch (error) {
      toast.error("Chatroom konnte nicht gelöscht werden.");
    }
  };

  const handleChatroomClick = (chatroomId: string) => {
    navigate(`/chatrooms/${chatroomId}/messages`);
  };

  const openEditDialog = (chatroom: Chatroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChatroom(chatroom);
    setImagePreview(chatroom.imageUrl || null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (chatroom: Chatroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChatroom(chatroom);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-fit p-0 mb-2 sm:mb-0 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Chatroom Management</h1>
            <div className="text-base sm:text-lg text-muted-foreground max-w-md">
              Verwalten Sie hier alle Chatrooms und deren Einstellungen
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto cursor-pointer text-base font-semibold px-4 py-2">
                <Plus className="mr-2 h-4 w-4" />
                Neuer Chatroom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Chatroom erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Chatroom mit den gewünschten Einstellungen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={newChatroom.title}
                    onChange={(e) => setNewChatroom({ ...newChatroom, title: e.target.value })}
                    placeholder="Chatroom Titel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={newChatroom.description}
                    onChange={(e) => setNewChatroom({ ...newChatroom, description: e.target.value })}
                    placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chatroom Bild</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Vorschau"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Bild auswählen
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateChatroom}>
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chatroom bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die Einstellungen des Chatrooms.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titel</Label>
                <Input
                  id="edit-title"
                  value={selectedChatroom?.title || ''}
                  onChange={(e) => setSelectedChatroom(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Chatroom Titel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Beschreibung</Label>
                <Textarea
                  id="edit-description"
                  value={selectedChatroom?.description || ''}
                  onChange={(e) => setSelectedChatroom(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
                />
              </div>
              <div className="space-y-2">
                <Label>Chatroom Bild</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Vorschau"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <Label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Bild auswählen
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditChatroom}>
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chatroom löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie den Chatroom "{selectedChatroom?.title}" wirklich löschen?
                Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteChatroom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              Lade Chatrooms...
            </div>
          ) : chatrooms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Keine Chatrooms vorhanden. Erstellen Sie einen neuen Chatroom!
            </div>
          ) : (
            chatrooms.map((chatroom) => (
              <Card
                key={chatroom.id}
                className="cursor-pointer hover:shadow-lg transition-shadow p-2 sm:p-4 flex flex-col justify-between h-full"
                onClick={() => handleChatroomClick(chatroom.id)}
              >
                <CardHeader className="pb-2">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      {chatroom.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">{chatroom.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {chatroom.imageUrl && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={chatroom.imageUrl}
                          alt={chatroom.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {chatroom.participants.length} Teilnehmer
                    </div>
                    {chatroom.lastMessage && (
                      <div className="text-xs text-muted-foreground">
                        Letzte Nachricht: {chatroom.lastMessage.content}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-4 border-t mt-2">
                  <div className="text-xs text-muted-foreground w-full text-center">
                    Erstellt am {format(new Date(chatroom.createdAt), 'dd.MM.yyyy', { locale: de })}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button 
                      variant="outline" 
                      onClick={(e) => { e.stopPropagation(); openEditDialog(chatroom, e); }}
                      className="w-full sm:w-auto cursor-pointer flex items-center justify-center"
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Bearbeiten
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={(e) => { e.stopPropagation(); openDeleteDialog(chatroom, e); }}
                      className="w-full sm:w-auto cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Löschen
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 