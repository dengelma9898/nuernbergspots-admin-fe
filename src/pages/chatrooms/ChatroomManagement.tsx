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
import {
  getUserFriendlyError,
  showUserFriendlyError,
  showSuccessMessage,
  type UserFriendlyError,
} from '@/utils/errorUtils';
import { AlertCircle } from 'lucide-react';
import { Background } from '@/components/Background';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
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
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [createError, setCreateError] = useState<UserFriendlyError | null>(null);
  const [editError, setEditError] = useState<UserFriendlyError | null>(null);

  // Zentrale Bildvalidierung für Create-Dialog
  const createImageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });

  // Zentrale Bildvalidierung für Edit-Dialog
  const editImageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });
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
      // Stelle sicher, dass data ein Array ist
      if (Array.isArray(data)) {
        setChatrooms(data);
      } else {
        console.error('Ungültiges Datenformat beim Laden der Chatrooms:', data);
        showUserFriendlyError(
          new Error('Ungültiges Datenformat'),
          toast,
          () => loadChatrooms(),
          'load-chatroom'
        );
        setChatrooms([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Chatrooms:', error);
      showUserFriendlyError(error, toast, () => loadChatrooms(), 'load-chatroom');
      setChatrooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler für Create-Dialog
  const handleCreateImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    createImageUpload.handleFileChange(event);
    // Konvertiere Hook-Error zu UserFriendlyError für Kompatibilität
    if (createImageUpload.error) {
      setCreateError({
        title: createImageUpload.error.title,
        message: createImageUpload.error.message,
        isPersistent: true,
        actionHint: createImageUpload.error.actionHint,
      });
    } else {
      setCreateError(null);
    }
  };

  // Handler für Edit-Dialog
  const handleEditImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    editImageUpload.handleFileChange(event);
    // Konvertiere Hook-Error zu UserFriendlyError für Kompatibilität
    if (editImageUpload.error) {
      setEditError({
        title: editImageUpload.error.title,
        message: editImageUpload.error.message,
        isPersistent: true,
        actionHint: editImageUpload.error.actionHint,
      });
    } else {
      setEditError(null);
    }
  };

  const handleCreateChatroom = async () => {
    setCreateError(null);
    try {
      const createdChatroom = await chatroomService.createChatroom(newChatroom);

      if (createImageUpload.files.length > 0) {
        try {
          const imageUrl = await chatroomService.uploadChatroomImage(
            createdChatroom.id,
            createImageUpload.files[0]
          );
          await chatroomService.updateChatroom(createdChatroom.id, { image: imageUrl });
        } catch (imageError: any) {
          const friendlyError = getUserFriendlyError(imageError);
          setCreateError(friendlyError);
          showUserFriendlyError(imageError, toast, undefined, 'upload-image');
          return;
        }
      }

      showSuccessMessage(toast, {
        title: 'Chatroom wurde erfolgreich erstellt',
        description: `"${newChatroom.title}" wurde erfolgreich erstellt.`,
      });
      setIsCreateDialogOpen(false);
      setCreateError(null);
      setNewChatroom({
        title: '',
        description: '',
        imageUrl: '',
        participants: [],
      });
      createImageUpload.clearImages();
      loadChatrooms();
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error, 'save-event');
      setCreateError(friendlyError);
      // Kein Toast, da Fehler im Dialog angezeigt wird
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
      if (editImageUpload.files.length > 0) {
        try {
          const imageUrl = await chatroomService.uploadChatroomImage(
            selectedChatroom.id,
            editImageUpload.files[0]
          );
          updateData.image = imageUrl;
        } catch (imageError: any) {
          const friendlyError = getUserFriendlyError(imageError);
          setEditError(friendlyError);
          showUserFriendlyError(imageError, toast, undefined, 'upload-image');
          return;
        }
      }
      // Prüfe ob das bestehende Bild gelöscht werden soll
      // (wenn ursprünglich ein Bild vorhanden war, aber jetzt kein neues Bild ausgewählt wurde und originalImageUrl null ist)
      else if (originalImageUrl === null && selectedChatroom.imageUrl) {
        updateData.image = '';
      }

      // Führe das Update in einem Request aus
      await chatroomService.updateChatroom(selectedChatroom.id, updateData);

      showSuccessMessage(toast, {
        title: 'Chatroom wurde erfolgreich aktualisiert',
        description: `"${selectedChatroom.title}" wurde erfolgreich aktualisiert.`,
      });
      setIsEditDialogOpen(false);
      setEditError(null);
      setSelectedChatroom(null);
      editImageUpload.clearImages();
      setOriginalImageUrl(null);
      loadChatrooms();
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error, 'save-event');
      setEditError(friendlyError);
      // Kein Toast, da Fehler im Dialog angezeigt wird
    }
  };

  const handleDeleteChatroom = async () => {
    if (!selectedChatroom) return;

    try {
      const chatroomTitle = selectedChatroom.title;
      await chatroomService.deleteChatroom(selectedChatroom.id);
      showSuccessMessage(toast, {
        title: 'Chatroom wurde erfolgreich gelöscht',
        description: `"${chatroomTitle}" wurde erfolgreich gelöscht.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedChatroom(null);
      loadChatrooms();
    } catch (error) {
      console.error('Fehler beim Löschen des Chatrooms:', error);
      showUserFriendlyError(error, toast, () => handleDeleteChatroom(), 'delete-event');
    }
  };

  const handleChatroomClick = (chatroomId: string) => {
    navigate(`/chatrooms/${chatroomId}/messages`);
  };

  const openEditDialog = (chatroom: Chatroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChatroom(chatroom);
    setOriginalImageUrl(chatroom.imageUrl || null);
    editImageUpload.clearImages();
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
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    className={cn(glassButton, 'rounded-full mb-2 sm:mb-0')}
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Zurück zum Dashboard</span>
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
                      <DialogTitle className="text-foreground">
                        Neuen Chatroom erstellen
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Erstellen Sie einen neuen Chatroom mit den gewünschten Einstellungen.
                      </DialogDescription>
                    </DialogHeader>
                    {(createError || createImageUpload.error) && (
                      <Alert
                        variant="destructive"
                        className={cn(glassCard, 'border-destructive/50')}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>
                          {createImageUpload.error?.title || createError?.title}
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                          <p>{createImageUpload.error?.message || createError?.message}</p>
                          {(createImageUpload.error?.actionHint || createError?.actionHint) && (
                            <p className="mt-2 text-sm opacity-90">
                              {createImageUpload.error?.actionHint || createError?.actionHint}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
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
                            {createImageUpload.previewUrls.length > 0 ? (
                              <>
                                <img
                                  src={createImageUpload.previewUrls[0]}
                                  alt="Vorschau"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => createImageUpload.removeImage(0)}
                                  className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-colors"
                                  aria-label="Bild entfernen"
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
                              onChange={handleCreateImageSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <Label
                              htmlFor="image-upload"
                              className={cn(
                                glassButton,
                                'cursor-pointer inline-flex items-center justify-center text-sm font-medium h-10 px-4 py-2'
                              )}
                            >
                              Bild auswählen
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <AnimatedButton
                        variant="ghost"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          createImageUpload.clearImages();
                          setCreateError(null);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
                      >
                        Abbrechen
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outline"
                        onClick={handleCreateChatroom}
                        className={cn(glassButton, 'rounded-xl')}
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
                  editImageUpload.clearImages();
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
                {(editError || editImageUpload.error) && (
                  <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{editImageUpload.error?.title || editError?.title}</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p>{editImageUpload.error?.message || editError?.message}</p>
                      {(editImageUpload.error?.actionHint || editError?.actionHint) && (
                        <p className="mt-2 text-sm opacity-90">
                          {editImageUpload.error?.actionHint || editError?.actionHint}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
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
                        {editImageUpload.previewUrls.length > 0 || originalImageUrl ? (
                          <>
                            <img
                              src={editImageUpload.previewUrls[0] || originalImageUrl || ''}
                              alt="Vorschau"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editImageUpload.previewUrls.length > 0) {
                                  // Neues Bild entfernen
                                  editImageUpload.removeImage(0);
                                } else if (originalImageUrl) {
                                  // Ursprüngliches Bild markieren zum Löschen
                                  setOriginalImageUrl(null);
                                }
                              }}
                              className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-colors"
                              aria-label="Bild entfernen"
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
                          onChange={handleEditImageSelect}
                          className="hidden"
                          id="edit-image-upload"
                        />
                        <Label
                          htmlFor="edit-image-upload"
                          className={cn(
                            glassButton,
                            'cursor-pointer inline-flex items-center justify-center text-sm font-medium h-10 px-4 py-2'
                          )}
                        >
                          Bild auswählen
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all border-0 rounded-xl"
                  >
                    Abbrechen
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    onClick={handleEditChatroom}
                    className={cn(glassButton, 'rounded-xl')}
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
                  <AlertDialogCancel className={cn(glassButton)}>Abbrechen</AlertDialogCancel>
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
              key={`chatrooms-${chatrooms.length}-${isLoading}`}
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
                chatrooms.map(chatroom => (
                  <motion.div key={chatroom.id} variants={fadeInUp}>
                    <Card
                      className={cn(
                        glassCard,
                        'cursor-pointer rounded-2xl p-2 sm:p-4 flex flex-col justify-between h-full'
                      )}
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
                            className={cn(
                              glassButton,
                              'w-full sm:w-auto flex items-center justify-center'
                            )}
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
