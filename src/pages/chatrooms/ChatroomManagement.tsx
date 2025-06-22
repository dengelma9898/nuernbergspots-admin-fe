import React, { useEffect, useState } from 'react';
import { useChatroomService } from '@/services/chatroomService';
import { Chatroom } from '@/models/chatroom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus,
  MessageCircle,
  Users,
  Trash2,
  Edit2,
  Image as ImageIcon,
  X,
  ArrowLeft,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

function ChatroomSkeleton() {
  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full ring-1 ring-white/30">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-6 w-3/4 bg-white/10 backdrop-blur-xl rounded" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
            <Skeleton className="h-4 w-2/3 mt-1 bg-white/10 backdrop-blur-xl rounded" />
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Image placeholder */}
          <Skeleton className="aspect-video rounded-lg bg-white/10 backdrop-blur-xl" />

          {/* Participants info */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded bg-white/10 backdrop-blur-xl" />
            <Skeleton className="h-4 w-24 bg-white/10 backdrop-blur-xl rounded" />
          </div>

          {/* Last message */}
          <Skeleton className="h-3 w-5/6 bg-white/10 backdrop-blur-xl rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-white/20 mt-2">
        {/* Created date */}
        <Skeleton className="h-3 w-32 bg-white/10 backdrop-blur-xl rounded mx-auto" />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 bg-white/10 backdrop-blur-xl rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 bg-white/10 backdrop-blur-xl rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

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
    participants: [] as string[],
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
      toast.error('Chatrooms konnten nicht geladen werden.');
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
        const imageUrl = await chatroomService.uploadChatroomImage(
          createdChatroom.id,
          selectedImage
        );
        await chatroomService.updateChatroom(createdChatroom.id, { imageUrl });
      }

      toast.success('Chatroom wurde erfolgreich erstellt.');
      setIsCreateDialogOpen(false);
      setNewChatroom({
        title: '',
        description: '',
        imageUrl: '',
        participants: [],
      });
      setSelectedImage(null);
      setImagePreview(null);
      loadChatrooms();
    } catch (error) {
      toast.error('Chatroom konnte nicht erstellt werden.');
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
        const imageUrl = await chatroomService.uploadChatroomImage(
          selectedChatroom.id,
          selectedImage
        );
        await chatroomService.updateChatroom(selectedChatroom.id, { imageUrl });
      }

      toast.success('Chatroom wurde erfolgreich aktualisiert.');
      setIsEditDialogOpen(false);
      setSelectedChatroom(null);
      setSelectedImage(null);
      setImagePreview(null);
      loadChatrooms();
    } catch (error) {
      toast.error('Chatroom konnte nicht aktualisiert werden.');
    }
  };

  const handleDeleteChatroom = async () => {
    if (!selectedChatroom) return;

    try {
      await chatroomService.deleteChatroom(selectedChatroom.id);
      toast.success('Chatroom wurde erfolgreich gelöscht.');
      setIsDeleteDialogOpen(false);
      setSelectedChatroom(null);
      loadChatrooms();
    } catch (error) {
      toast.error('Chatroom konnte nicht gelöscht werden.');
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl relative z-10">
        <div className="space-y-6 sm:space-y-8">
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="w-fit p-0 mb-2 sm:mb-0 cursor-pointer backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zum Dashboard
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                  Chatroom Management
                </h1>
                <div className="text-base sm:text-lg text-white/80 max-w-md">
                  Verwalten Sie hier alle Chatrooms und deren Einstellungen
                </div>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto cursor-pointer text-base font-semibold px-4 py-2 backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Neuer Chatroom
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Neuen Chatroom erstellen</DialogTitle>
                    <DialogDescription className="text-white/80">
                      Erstellen Sie einen neuen Chatroom mit den gewünschten Einstellungen.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white/90">
                        Titel
                      </Label>
                      <Input
                        id="title"
                        value={newChatroom.title}
                        onChange={e => setNewChatroom({ ...newChatroom, title: e.target.value })}
                        placeholder="Chatroom Titel"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white/90">
                        Beschreibung
                      </Label>
                      <Textarea
                        id="description"
                        value={newChatroom.description}
                        onChange={e =>
                          setNewChatroom({ ...newChatroom, description: e.target.value })
                        }
                        placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
                        className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Chatroom Bild</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32 border-2 border-dashed border-white/30 rounded-lg overflow-hidden">
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
                                className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/10">
                              <ImageIcon className="h-8 w-8 text-white/60" />
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
                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 hover:scale-105 hover:shadow-xl rounded-xl"
                          >
                            Bild auswählen
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="backdrop-blur-2xl bg-white/10 text-white hover:bg-white/20 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={handleCreateChatroom}
                      className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                    >
                      Erstellen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Chatroom bearbeiten</DialogTitle>
                <DialogDescription className="text-white/80">
                  Bearbeiten Sie die Einstellungen des Chatrooms.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-white/90">
                    Titel
                  </Label>
                  <Input
                    id="edit-title"
                    value={selectedChatroom?.title || ''}
                    onChange={e =>
                      setSelectedChatroom(prev =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    placeholder="Chatroom Titel"
                    className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-white/90">
                    Beschreibung
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={selectedChatroom?.description || ''}
                    onChange={e =>
                      setSelectedChatroom(prev =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
                    className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90">Chatroom Bild</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 border-2 border-dashed border-white/30 rounded-lg overflow-hidden">
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
                            className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10">
                          <ImageIcon className="h-8 w-8 text-white/60" />
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
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 hover:scale-105 hover:shadow-xl rounded-xl"
                      >
                        Bild auswählen
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="backdrop-blur-2xl bg-white/10 text-white hover:bg-white/20 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleEditChatroom}
                  className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                >
                  Speichern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Chatroom löschen</AlertDialogTitle>
                <AlertDialogDescription className="text-white/80">
                  Möchten Sie den Chatroom "{selectedChatroom?.title}" wirklich löschen? Diese
                  Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="backdrop-blur-2xl bg-white/10 text-white hover:bg-white/20 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl">
                  Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteChatroom}
                  className="backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {isLoading ? (
              // Show 6 skeleton chatroom cards
              Array.from({ length: 6 }).map((_, index) => <ChatroomSkeleton key={index} />)
            ) : chatrooms.length === 0 ? (
              <div className="col-span-full backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 text-center">
                <div className="text-white/90 text-lg">
                  Keine Chatrooms vorhanden. Erstellen Sie einen neuen Chatroom!
                </div>
              </div>
            ) : (
              chatrooms.map(chatroom => (
                <Card
                  key={chatroom.id}
                  className="cursor-pointer backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full ring-1 ring-white/30"
                  onClick={() => handleChatroomClick(chatroom.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                        <MessageCircle className="h-5 w-5 text-white/90" />
                        {chatroom.title}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-white/80">
                        {chatroom.description}
                      </CardDescription>
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
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Users className="h-4 w-4" />
                        {chatroom.participants.length} Teilnehmer
                      </div>
                      {chatroom.lastMessage && (
                        <div className="text-xs text-white/60">
                          Letzte Nachricht: {chatroom.lastMessage.content}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-4 border-t border-white/20 mt-2">
                    <div className="text-xs text-white/70 w-full text-center">
                      Erstellt am{' '}
                      {format(new Date(chatroom.createdAt), 'dd.MM.yyyy', { locale: de })}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          openEditDialog(chatroom, e);
                        }}
                        className="w-full sm:w-auto cursor-pointer flex items-center justify-center backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
                      >
                        <Edit2 className="h-4 w-4 mr-2" /> Bearbeiten
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={e => {
                          e.stopPropagation();
                          openDeleteDialog(chatroom, e);
                        }}
                        className="w-full sm:w-auto cursor-pointer flex items-center justify-center backdrop-blur-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-300/30 hover:border-red-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
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
    </div>
  );
}
