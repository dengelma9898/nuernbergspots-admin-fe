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
import { Plus, MessageCircle, Users, Trash2, Edit2, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ChatroomManagement() {
  const chatroomService = useChatroomService();
  const navigate = useNavigate();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const handleDeleteChatroom = async (id: string) => {
    if (window.confirm('Möchten Sie diesen Chatroom wirklich löschen?')) {
      try {
        await chatroomService.deleteChatroom(id);
        toast.success("Chatroom wurde erfolgreich gelöscht.");
        loadChatrooms();
      } catch (error) {
        toast.error("Chatroom konnte nicht gelöscht werden.");
      }
    }
  };

  const handleChatroomClick = (chatroomId: string) => {
    navigate(`/chatrooms/${chatroomId}/messages`);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Chatroom Management</h1>
            <div className="text-lg text-muted-foreground">
              Verwalten Sie hier alle Chatrooms und deren Einstellungen
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleChatroomClick(chatroom.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        {chatroom.title}
                      </CardTitle>
                      <CardDescription>{chatroom.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChatroom(chatroom.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chatroom.imageUrl && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={chatroom.imageUrl}
                          alt={chatroom.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      {chatroom.lastMessage && (
                        <div className="text-sm text-muted-foreground">
                          Letzte Nachricht: {chatroom.lastMessage.content}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {chatroom.participants.length} Teilnehmer
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Erstellt am {format(new Date(chatroom.createdAt), 'dd.MM.yyyy', { locale: de })}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 