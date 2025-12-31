import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatMessageService, ChatMessage, ReactionType } from '@/services/chatMessageService';
import { useUserService } from '@/services/userService';
import { useChatroomService } from '@/services/chatroomService';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/models/users';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Send, Smile, MoreVertical, Edit2, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/LoadingButton';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, slideInRight } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

function ChatMessageSkeleton({ isOwnMessage = false }: { isOwnMessage?: boolean }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-[70%]">
        <div className={cn(glassCard, 'rounded-lg p-3')}>
          {!isOwnMessage && (
            <Skeleton className="h-4 w-20 mb-1 rounded" />
          )}
          <div className="space-y-1">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-6 w-6 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessages() {
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

  useEffect(() => {
    if (!chatroomId) {
      showUserFriendlyError(new Error('Chatroom ID fehlt'), toast, undefined, 'load-chatroom');
      return;
    }
    loadChatroomName();
    loadMessages();
    loadUserRole();
  }, [chatroomId]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadChatroomName(),
        loadMessages(),
        loadUserRole()
      ]);
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
      showUserFriendlyError(error, toast, () => handleEditMessage(messageId, content), 'send-message');
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

  const getReactionEmoji = (type: ReactionType): string => {
    switch (type) {
      case ReactionType.LIKE:
        return '👍';
      case ReactionType.LOVE:
        return '❤️';
      case ReactionType.LAUGH:
        return '😂';
      case ReactionType.WOW:
        return '😮';
      case ReactionType.SAD:
        return '😢';
      case ReactionType.ANGRY:
        return '😠';
      default:
        return '👍';
    }
  };

  const getReactionLabel = (type: ReactionType): string => {
    switch (type) {
      case ReactionType.LIKE:
        return 'Gefällt mir';
      case ReactionType.LOVE:
        return 'Liebe';
      case ReactionType.LAUGH:
        return 'Lustig';
      case ReactionType.WOW:
        return 'Wow';
      case ReactionType.SAD:
        return 'Traurig';
      case ReactionType.ANGRY:
        return 'Wütend';
      default:
        return 'Gefällt mir';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden w-full max-w-full">
        <Background />
        {/* Main Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)] relative z-10 w-full max-w-full overflow-x-hidden">
          <motion.div
            className={cn(glassCard, 'm-4 p-4')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/chatrooms')}
                  className={cn(glassButton, 'rounded-full flex-shrink-0')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zu Chatrooms</span>
                </AnimatedButton>
                <h1 className="text-xl font-semibold text-foreground truncate">
                  {chatroomName || 'Lädt...'}
                </h1>
              </div>
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(glassButton, 'rounded-full flex-shrink-0')}
                title="Aktualisieren"
              >
                <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
                <span className="sr-only">Aktualisieren</span>
              </AnimatedButton>
            </div>
          </motion.div>
          <motion.div
            className={cn(glassCard, 'flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 mx-4')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
            style={{ overflowX: 'hidden' }}
          >
            {isLoading ? (
              // Show skeleton loading messages
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ChatMessageSkeleton
                    key={index}
                    isOwnMessage={index % 3 === 0} // Mix of own and other messages
                  />
                ))}
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'} w-full max-w-full`}
                  variants={slideInRight}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: index * 0.05 }}
                >
                  <div className="relative max-w-[70%] min-w-0 flex-shrink-0" style={{ overflow: 'visible' }}>
                    {editingMessage === message.id ? (
                      <>
                        <div className={cn(glassCard, 'rounded-lg p-3')} style={{ overflow: 'visible' }}>
                          <Input
                            defaultValue={message.content}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const input = e.currentTarget;
                                handleEditMessage(message.id, input.value);
                              }
                              if (e.key === 'Escape') {
                                setEditingMessage(null);
                              }
                            }}
                            autoFocus
                            className={cn(glassInput, 'w-full')}
                            onBlur={(e) => {
                              // Delay to allow Enter key to fire first
                              setTimeout(() => {
                                if (editingMessage === message.id) {
                                  handleEditMessage(message.id, e.currentTarget.value);
                                }
                              }, 200);
                            }}
                          />
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMessage(null)}
                              className="text-xs"
                            >
                              Abbrechen
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.closest('.rounded-lg')?.querySelector('input') as HTMLInputElement;
                                if (input) {
                                  handleEditMessage(message.id, input.value);
                                }
                              }}
                              className="text-xs"
                            >
                              Speichern
                            </Button>
                          </div>
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div
                            className={cn(glassCard, `absolute left-4 -bottom-4 flex gap-1 px-2 py-1 rounded-full text-base z-10`, isOwnMessage(message) ? 'right-4 left-auto' : '')}
                            style={{ minHeight: '28px' }}
                          >
                            {message.reactions.map((reaction, index) => (
                              <span key={index} className="text-xs">
                                {getReactionEmoji(reaction.type as ReactionType)}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className={cn(glassCard, 'rounded-lg p-3')} style={{ overflow: 'visible' }}>
                          {!isOwnMessage(message) && (
                            <div className="text-sm font-semibold mb-1 text-foreground">
                              {message.senderName}
                            </div>
                          )}
                          <div className="text-sm whitespace-pre-line text-foreground break-words">
                            {message.content}
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground min-w-0 gap-2 relative" style={{ overflow: 'visible' }}>
                            <span className="truncate min-w-0 flex-1">
                              {format(new Date(message.createdAt), 'HH:mm', { locale: de })}
                              {message.editedAt && (
                                message.editedByAdmin ? ' (von Admin bearbeitet)' : ' (bearbeitet)'
                              )}
                            </span>
                            <div className="flex-shrink-0 relative" style={{ zIndex: openMenuId === message.id ? 1000 : 'auto' }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 hover:bg-accent/50 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === message.id ? null : message.id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          <AnimatePresence>
                            {openMenuId === message.id && (
                              <motion.div
                                ref={el => (menuRefs.current[message.id] = el)}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className={cn(
                                  'absolute min-w-[180px] py-1 rounded-md shadow-lg border',
                                  isOwnMessage(message) ? 'right-0' : 'left-0',
                                  'top-full mt-1'
                                )}
                                style={{ 
                                  zIndex: 1000,
                                  position: 'absolute',
                                  backgroundColor: 'hsl(var(--popover))',
                                  color: 'hsl(var(--popover-foreground))',
                                  backdropFilter: 'blur(16px) saturate(180%)',
                                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                                  display: 'block',
                                  visibility: 'visible',
                                  opacity: 1,
                                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                              {canEditOrDeleteMessage(message) && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMessage(message.id);
                                      setOpenMenuId(null);
                                    }}
                                    className={cn(
                                      'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left'
                                    )}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                    Bearbeiten
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteMessage(message.id);
                                      setOpenMenuId(null);
                                    }}
                                    className={cn(
                                      'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 transition-colors cursor-pointer text-left text-destructive'
                                    )}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Löschen
                                  </button>
                                  <div className="h-px bg-border my-1" />
                                </>
                              )}
                              <button
                                onClick={() => {
                                  handleReaction(message.id, ReactionType.LIKE);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left"
                              >
                                <span>{getReactionEmoji(ReactionType.LIKE)}</span>
                                {getReactionLabel(ReactionType.LIKE)}
                              </button>
                              <button
                                onClick={() => {
                                  handleReaction(message.id, ReactionType.LOVE);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left"
                              >
                                <span>{getReactionEmoji(ReactionType.LOVE)}</span>
                                {getReactionLabel(ReactionType.LOVE)}
                              </button>
                              <button
                                onClick={() => {
                                  handleReaction(message.id, ReactionType.LAUGH);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left"
                              >
                                <span>{getReactionEmoji(ReactionType.LAUGH)}</span>
                                {getReactionLabel(ReactionType.LAUGH)}
                              </button>
                              <button
                                onClick={() => {
                                  handleReaction(message.id, ReactionType.WOW);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left"
                              >
                                <span>{getReactionEmoji(ReactionType.WOW)}</span>
                                {getReactionLabel(ReactionType.WOW)}
                              </button>
                              <button
                                onClick={() => {
                                  handleReaction(message.id, ReactionType.SAD);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left"
                              >
                                <span>{getReactionEmoji(ReactionType.SAD)}</span>
                                {getReactionLabel(ReactionType.SAD)}
                              </button>
                              <button
                                onClick={() => {
                                  handleReaction(message.id, ReactionType.ANGRY);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-pointer text-left"
                              >
                                <span>{getReactionEmoji(ReactionType.ANGRY)}</span>
                                {getReactionLabel(ReactionType.ANGRY)}
                              </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                            </div>
                          </div>
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div
                            className={cn(glassCard, `absolute left-4 -bottom-4 flex gap-1 px-2 py-1 rounded-full text-base z-10`, isOwnMessage(message) ? 'right-4 left-auto' : '')}
                            style={{ minHeight: '28px' }}
                          >
                            {message.reactions.map((reaction, index) => (
                              <span key={index} className="text-xs">
                                {getReactionEmoji(reaction.type as ReactionType)}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </motion.div>
          <motion.div
            className={cn(glassCard, 'm-4 p-4')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nachricht eingeben..."
                className={cn(glassInput, 'flex-1')}
              />
              <AnimatedButton
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                data-testid="send-button"
              >
                <Send className="h-4 w-4" />
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
