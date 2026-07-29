import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useChatMessageService, ChatMessage, ReactionType } from '@/services/chatMessageService';
import { useUserService } from '@/services/userService';
import { useChatroomService } from '@/services/chatroomService';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/models/users';
import { showUserFriendlyError } from '@/utils/errorUtils';

export function useChatMessages() {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const navigate = useNavigate();
  const chatMessageService = useChatMessageService();
  const userService = useUserService();
  const chatroomService = useChatroomService();
  const { getUserId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [chatroomName, setChatroomName] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const loadChatroomName = async () => {
    if (!chatroomId) return;

    try {
      const chatroom = await chatroomService.getChatroom(chatroomId);
      setChatroomName(chatroom.title);
    } catch (error) {
      console.error('Fehler beim Laden des Chatroom-Namens:', error);
      setChatroomName('Unbekannter Chatroom');
    }
  };

  const loadUserRole = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const userProfile = await userService.getUserProfile(userId);
      setUserRole(userProfile.userType);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  };

  const loadMessages = async () => {
    if (!chatroomId) return;

    try {
      setIsLoading(true);
      const data = await chatMessageService.getMessages(chatroomId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      showUserFriendlyError(error, toast, () => loadMessages(), 'load-chatroom');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!chatroomId) {
      showUserFriendlyError(new Error('Chatroom ID fehlt'), toast, undefined, 'load-chatroom');
      return;
    }
    loadChatroomName();
    loadMessages();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatroomId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadChatroomName(), loadMessages(), loadUserRole()]);
      toast.success('Daten erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      showUserFriendlyError(error, toast, undefined, 'refresh-chatroom');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatroomId) return;

    try {
      const userId = getUserId();
      if (!userId) throw new Error('Benutzer nicht authentifiziert');

      const userProfile = await userService.getUserProfile(userId);
      if (!userProfile || !userProfile.name)
        throw new Error('Benutzerprofil konnte nicht geladen werden');
      const message = await chatMessageService.createMessage(chatroomId, {
        content: newMessage,
        senderId: userId,
        senderName: userProfile.name,
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      showUserFriendlyError(error, toast, () => handleSendMessage(), 'send-message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const isSuperAdmin = userRole === UserType.SUPER_ADMIN;
      const updatedMessage = isSuperAdmin
        ? await chatMessageService.adminUpdateMessage(chatroomId!, messageId, {
            content,
          })
        : await chatMessageService.updateMessage(chatroomId!, messageId, {
            content,
          });
      setMessages(prev => prev.map(msg => (msg.id === messageId ? updatedMessage : msg)));
      setEditingMessage(null);
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Nachricht:', error);
      showUserFriendlyError(
        error,
        toast,
        () => handleEditMessage(messageId, content),
        'send-message'
      );
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const isSuperAdmin = userRole === UserType.SUPER_ADMIN;
      if (isSuperAdmin) {
        await chatMessageService.adminDeleteMessage(chatroomId!, messageId);
      } else {
        await chatMessageService.deleteMessage(chatroomId!, messageId);
      }
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      showUserFriendlyError(error, toast, () => handleDeleteMessage(messageId), 'send-message');
    }
  };

  const handleReaction = async (messageId: string, type: ReactionType) => {
    try {
      const updatedMessage = await chatMessageService.addReaction(chatroomId!, messageId, { type });
      setMessages(prev => prev.map(msg => (msg.id === messageId ? updatedMessage : msg)));
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Reaktion:', error);
      showUserFriendlyError(error, toast, () => handleReaction(messageId, type), 'send-message');
    }
  };

  const isOwnMessage = (message: ChatMessage) => message.senderId === getUserId();

  const canEditOrDeleteMessage = (message: ChatMessage) => {
    return isOwnMessage(message) || userRole === UserType.SUPER_ADMIN;
  };

  return {
    navigate,
    messages,
    newMessage,
    setNewMessage,
    editingMessage,
    setEditingMessage,
    isLoading,
    openMenuId,
    setOpenMenuId,
    chatroomName,
    isRefreshing,
    messagesEndRef,
    menuRefs,
    handleRefresh,
    handleSendMessage,
    handleKeyPress,
    handleEditMessage,
    handleDeleteMessage,
    handleReaction,
    isOwnMessage,
    canEditOrDeleteMessage,
  };
}
