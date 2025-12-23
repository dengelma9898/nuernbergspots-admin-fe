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
import { getUserFriendlyError, showUserFriendlyError, type UserFriendlyError } from '@/utils/errorUtils';
import { AlertCircle } from 'lucide-react';
import { validateImageFile } from '@/utils/fileValidationUtils';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

function ChatroomSkeleton() {
  return (
    <Card className={cn(glassCard, 'rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full')}>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-3/4 rounded" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 mt-1 rounded" />
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Image placeholder */}
          <Skeleton className="aspect-video rounded-lg" />

          {/* Participants info */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          {/* Last message */}
          <Skeleton className="h-3 w-5/6 rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-secondary mt-2">
        {/* Created date */}
        <Skeleton className="h-3 w-32 rounded mx-auto" />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-auto sm:flex-1 rounded-xl" />
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
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [createError, setCreateError] = useState<UserFriendlyError | null>(null);
  const [editError, setEditError] = useState<UserFriendlyError | null>(null);
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
      // Validiere Datei vor der Auswahl (max 1 MB für Chatrooms)
      const validation = validateImageFile(file, 1);
      
      if (!validation.isValid && validation.error) {
        // Zeige Fehler sofort an
        const friendlyError = {
          title: validation.error.title,
          message: validation.error.message,
          isPersistent: true,
          actionHint: validation.error.actionHint,
        };
        
        if (isEditDialogOpen) {
          setEditError(friendlyError);
        } else {
          setCreateError(friendlyError);
        }
        
        showUserFriendlyError(
          Object.assign(new Error(validation.error.message), { validationError: validation.error }),
          toast
        );
        
        // Setze File-Input zurück
        event.target.value = '';
        return;
      }
      
      setSelectedImage(file);
      // Lösche Fehler wenn Datei gültig ist
      if (isEditDialogOpen) {
        setEditError(null);
      } else {
        setCreateError(null);
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateChatroom = async () => {
    setCreateError(null);
    try {
      const createdChatroom = await chatroomService.createChatroom(newChatroom);

      if (selectedImage) {
        try {
          const imageUrl = await chatroomService.uploadChatroomImage(
            createdChatroom.id,
            selectedImage
          );
          await chatroomService.updateChatroom(createdChatroom.id, { image: imageUrl });
        } catch (imageError: any) {
          const friendlyError = getUserFriendlyError(imageError);
          setCreateError(friendlyError);
          showUserFriendlyError(imageError, toast);
          return;
        }
      }

      toast.success('Chatroom wurde erfolgreich erstellt.');
      setIsCreateDialogOpen(false);
      setCreateError(null);
      setNewChatroom({
        title: '',
        description: '',
        imageUrl: '',
        participants: [],
      });
      setSelectedImage(null);
      setImagePreview(null);
      loadChatrooms();
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error);
      setCreateError(friendlyError);
      showUserFriendlyError(error, toast);
    }
  };

  const handleEditChatroom = async () => {
    if (!selectedChatroom) return;
    setEditError(null);

    try {
      // Bereite Update-Daten vor
      const updateData: {
        title: string;
        description: string;
        image?: string;
      } = {
        title: selectedChatroom.title,
        description: selectedChatroom.description,
      };

      // Prüfe ob ein neues Bild hochgeladen werden soll
      if (selectedImage) {
        try {
          const imageUrl = await chatroomService.uploadChatroomImage(
            selectedChatroom.id,
            selectedImage
          );
          updateData.image = imageUrl;
        } catch (imageError: any) {
          const friendlyError = getUserFriendlyError(imageError);
          setEditError(friendlyError);
          showUserFriendlyError(imageError, toast);
          return;
        }
      }
      // Prüfe ob das bestehende Bild gelöscht werden soll
      // (wenn ursprünglich ein Bild vorhanden war, aber jetzt kein neues Bild ausgewählt wurde)
      else if (originalImageUrl && !imagePreview) {
        updateData.image = '';
      }

      // Führe das Update in einem Request aus
      await chatroomService.updateChatroom(selectedChatroom.id, updateData);

      toast.success('Chatroom wurde erfolgreich aktualisiert.');
      setIsEditDialogOpen(false);
      setEditError(null);
      setSelectedChatroom(null);
      setSelectedImage(null);
      setImagePreview(null);
      setOriginalImageUrl(null);
      loadChatrooms();
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error);
      setEditError(friendlyError);
      showUserFriendlyError(error, toast);
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
    setOriginalImageUrl(chatroom.imageUrl || null);
    setSelectedImage(null);
    setEditError(null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (chatroom: Chatroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChatroom(chatroom);
    setIsDeleteDialogOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="container mx-auto p-4 sm:p-8 max-w-7xl relative z-10">
          <div className="space-y-6 sm:space-y-8">
            <motion.div
              className={cn(glassCard, 'p-6')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex flex-col gap-1">
                  <AnimatedButton
                    variant="ghost"
                    className="w-fit p-0 mb-2 sm:mb-0 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zum Dashboard
                  </AnimatedButton>
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
                    Chatroom Management
                  </h1>
                  <div className="text-base sm:text-lg text-muted-foreground max-w-md">
                    Verwalten Sie hier alle Chatrooms und deren Einstellungen
                  </div>
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={open => {
                    setIsCreateDialogOpen(open);
                    if (!open) {
                      setCreateError(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <AnimatedButton className="w-full sm:w-auto cursor-pointer text-base font-semibold px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      <Plus className="mr-2 h-4 w-4" />
                      Neuer Chatroom
                    </AnimatedButton>
                  </DialogTrigger>
                  <DialogContent className={cn(glassCard)}>
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Neuen Chatroom erstellen</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Erstellen Sie einen neuen Chatroom mit den gewünschten Einstellungen.
                      </DialogDescription>
                    </DialogHeader>
                    {createError && (
                      <Card className="rounded-lg border-destructive bg-destructive/10 p-4 space-y-2">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <h4 className="font-semibold text-destructive">{createError.title}</h4>
                            <p className="text-sm text-muted-foreground">{createError.message}</p>
                            {createError.actionHint && (
                              <p className="text-xs text-muted-foreground mt-2">{createError.actionHint}</p>
                            )}
                          </div>
                          <AnimatedButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setCreateError(null)}
                            className="text-destructive hover:text-destructive/90"
                            aria-label="Fehler schließen"
                          >
                            <X className="h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      </Card>
                    )}
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-foreground">
                          Titel
                        </Label>
                        <Input
                          id="title"
                          value={newChatroom.title}
                          onChange={e => setNewChatroom({ ...newChatroom, title: e.target.value })}
                          placeholder="Chatroom Titel"
                          className={cn(glassInput)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground">
                          Beschreibung
                        </Label>
                        <Textarea
                          id="description"
                          value={newChatroom.description}
                          onChange={e =>
                            setNewChatroom({ ...newChatroom, description: e.target.value })
                          }
                          placeholder="Beschreiben Sie den Zweck dieses Chatrooms"
                          className={cn(glassInput)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Chatroom Bild</Label>
                        <div className="flex items-center gap-4">
                          <div className="relative w-32 h-32 border-2 border-dashed border-secondary rounded-lg overflow-hidden">
                            {imagePreview ? (
                              <>
                                <img
                                  src={imagePreview}
                                  alt="Vorschau"
                                  className="w-full h-full object-cover"
                                />
                                <AnimatedButton
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full"
                                >
                                  <X className="h-4 w-4" />
                                </AnimatedButton>
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
                              className={cn(glassButton, 'cursor-pointer inline-flex items-center justify-center text-sm font-medium h-10 px-4 py-2')}
                            >
                              Bild auswählen
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <AnimatedButton
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className={cn(glassButton)}
                      >
                        Abbrechen
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={handleCreateChatroom}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                      >
                        Erstellen
                      </AnimatedButton>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            <Dialog
              open={isEditDialogOpen}
              onOpenChange={open => {
                setIsEditDialogOpen(open);
                if (!open) {
                  setEditError(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setOriginalImageUrl(null);
                }
              }}
            >
              <DialogContent className={cn(glassCard)}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Chatroom bearbeiten</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Bearbeiten Sie die Einstellungen des Chatrooms.
                  </DialogDescription>
                </DialogHeader>
                {editError && (
                  <Card className="rounded-lg border-destructive bg-destructive/10 p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-destructive">{editError.title}</h4>
                        <p className="text-sm text-muted-foreground">{editError.message}</p>
                        {editError.actionHint && (
                          <p className="text-xs text-muted-foreground mt-2">{editError.actionHint}</p>
                        )}
                      </div>
                      <AnimatedButton
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditError(null)}
                        className="text-destructive hover:text-destructive/90"
                        aria-label="Fehler schließen"
                      >
                        <X className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </Card>
                )}
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-foreground">
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
                      className={cn(glassInput)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-foreground">
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
                      className={cn(glassInput)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Chatroom Bild</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 border-2 border-dashed border-secondary rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Vorschau"
                              className="w-full h-full object-cover"
                            />
                            <AnimatedButton
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full"
                              aria-label="Bild entfernen"
                            >
                              <X className="h-4 w-4" />
                            </AnimatedButton>
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
                          className={cn(glassButton, 'cursor-pointer inline-flex items-center justify-center text-sm font-medium h-10 px-4 py-2')}
                        >
                          Bild auswählen
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className={cn(glassButton)}
                  >
                    Abbrechen
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={handleEditChatroom}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    Speichern
                  </AnimatedButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent className={cn(glassCard)}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Chatroom löschen</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Möchten Sie den Chatroom "{selectedChatroom?.title}" wirklich löschen? Diese
                    Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={cn(glassButton)}>
                    Abbrechen
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteChatroom}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {isLoading ? (
                // Show 6 skeleton chatroom cards
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <ChatroomSkeleton />
                  </motion.div>
                ))
              ) : chatrooms.length === 0 ? (
                <motion.div
                  className="col-span-full"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={defaultTransition}
                >
                  <Card className={cn(glassCard, 'p-8 text-center')}>
                    <div className="text-muted-foreground text-lg">
                      Keine Chatrooms vorhanden. Erstellen Sie einen neuen Chatroom!
                    </div>
                  </Card>
                </motion.div>
              ) : (
                chatrooms.map((chatroom, index) => (
                  <motion.div key={chatroom.id} variants={fadeInUp}>
                    <Card
                      className={cn(glassCard, 'cursor-pointer rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full')}
                      onClick={() => handleChatroomClick(chatroom.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-foreground">
                            <MessageCircle className="h-5 w-5 text-muted-foreground" />
                            {chatroom.title}
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base text-muted-foreground">
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
                                className="w-full h-full object-cover border border-secondary"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {chatroom.participants?.length ?? 0} Teilnehmer
                          </div>
                          {chatroom.lastMessage && (
                            <div className="text-xs text-muted-foreground">
                              Letzte Nachricht: {chatroom.lastMessage.content}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-secondary mt-2">
                        <div className="text-xs text-muted-foreground w-full text-center">
                          Erstellt am{' '}
                          {format(new Date(chatroom.createdAt), 'dd.MM.yyyy', { locale: de })}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <AnimatedButton
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation();
                              openEditDialog(chatroom, e);
                            }}
                            className={cn(glassButton, 'w-full sm:w-auto flex items-center justify-center')}
                          >
                            <Edit2 className="h-4 w-4 mr-2" /> Bearbeiten
                          </AnimatedButton>
                          <AnimatedButton
                            variant="destructive"
                            onClick={e => {
                              e.stopPropagation();
                              openDeleteDialog(chatroom, e);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Löschen
                          </AnimatedButton>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
