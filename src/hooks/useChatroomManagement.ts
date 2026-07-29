import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useChatroomService } from '@/services/chatroomService';
import { Chatroom } from '@/models/chatroom';
import {
  getUserFriendlyError,
  showUserFriendlyError,
  showSuccessMessage,
  type UserFriendlyError,
} from '@/utils/errorUtils';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';

const emptyChatroom = {
  title: '',
  description: '',
  imageUrl: '',
  participants: [] as string[],
};

export function useChatroomManagement() {
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
  const [newChatroom, setNewChatroom] = useState(emptyChatroom);

  const createImageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });

  const editImageUpload = useValidatedImageUpload({
    maxImages: 1,
    maxSizeMB: 1,
  });

  useEffect(() => {
    loadChatrooms();
  }, []);

  const loadChatrooms = async () => {
    try {
      setIsLoading(true);
      const data = await chatroomService.getChatrooms();
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

  const handleCreateImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    createImageUpload.handleFileChange(event);
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

  const handleEditImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    editImageUpload.handleFileChange(event);
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
        } catch (imageError: unknown) {
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
      setNewChatroom(emptyChatroom);
      createImageUpload.clearImages();
      await loadChatrooms();
    } catch (error: unknown) {
      const friendlyError = getUserFriendlyError(error, 'save-event');
      setCreateError(friendlyError);
    }
  };

  const handleEditChatroom = async () => {
    if (!selectedChatroom) return;
    setEditError(null);

    try {
      const updateData: {
        title: string;
        description: string;
        image?: string;
      } = {
        title: selectedChatroom.title,
        description: selectedChatroom.description,
      };

      if (editImageUpload.files.length > 0) {
        try {
          const imageUrl = await chatroomService.uploadChatroomImage(
            selectedChatroom.id,
            editImageUpload.files[0]
          );
          updateData.image = imageUrl;
        } catch (imageError: unknown) {
          const friendlyError = getUserFriendlyError(imageError);
          setEditError(friendlyError);
          showUserFriendlyError(imageError, toast, undefined, 'upload-image');
          return;
        }
      } else if (originalImageUrl === null && selectedChatroom.imageUrl) {
        updateData.image = '';
      }

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
      await loadChatrooms();
    } catch (error: unknown) {
      const friendlyError = getUserFriendlyError(error, 'save-event');
      setEditError(friendlyError);
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
      await loadChatrooms();
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

  return {
    navigate,
    chatrooms,
    isLoading,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedChatroom,
    setSelectedChatroom,
    originalImageUrl,
    setOriginalImageUrl,
    createError,
    setCreateError,
    editError,
    setEditError,
    newChatroom,
    setNewChatroom,
    createImageUpload,
    editImageUpload,
    handleCreateImageSelect,
    handleEditImageSelect,
    handleCreateChatroom,
    handleEditChatroom,
    handleDeleteChatroom,
    handleChatroomClick,
    openEditDialog,
    openDeleteDialog,
  };
}
