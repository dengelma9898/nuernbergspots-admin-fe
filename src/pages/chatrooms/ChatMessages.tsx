import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatMessageService, ChatMessage, ReactionType } from '@/services/chatMessageService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Send, Smile, MoreVertical, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
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
  const { getUserId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatroomId) {
      showUserFriendlyError(new Error('Chatroom ID fehlt'), toast);
      return;
    }
    loadMessages();
  }, [chatroomId]);

  const loadMessages = async () => {
    if (!chatroomId) return;

    try {
      setIsLoading(true);
      const data = await chatMessageService.getMessages(chatroomId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      showUserFriendlyError(error, toast);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      showUserFriendlyError(error, toast);
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
      const updatedMessage = await chatMessageService.updateMessage(chatroomId!, messageId, {
        content,
      });
      setMessages(prev => prev.map(msg => (msg.id === messageId ? updatedMessage : msg)));
      setEditingMessage(null);
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Nachricht:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatMessageService.deleteMessage(chatroomId!, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const handleReaction = async (messageId: string, type: ReactionType) => {
    try {
      const updatedMessage = await chatMessageService.addReaction(chatroomId!, messageId, { type });
      setMessages(prev => prev.map(msg => (msg.id === messageId ? updatedMessage : msg)));
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Reaktion:', error);
      showUserFriendlyError(error, toast);
    }
  };

  const isOwnMessage = (message: ChatMessage) => message.senderId === getUserId();

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
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)] relative z-10">
          <motion.div
            className={cn(glassCard, 'm-4 p-4')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <AnimatedButton
              variant="ghost"
              onClick={() => navigate('/chatrooms')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Chatrooms
            </AnimatedButton>
          </motion.div>
          <motion.div
            className={cn(glassCard, 'flex-1 overflow-y-auto p-4 space-y-4 mx-4')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.1 }}
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
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                  variants={slideInRight}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: index * 0.05 }}
                >
                  <div className="relative max-w-[70%]">
                    <div className={cn(glassCard, 'rounded-lg p-3')}>
                      {!isOwnMessage(message) && (
                        <div className="text-sm font-semibold mb-1 text-foreground">
                          {message.senderName}
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-line text-foreground">{message.content}</div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(message.createdAt), 'HH:mm', { locale: de })}
                          {message.editedAt && ' (bearbeitet)'}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <AnimatedButton
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </AnimatedButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className={cn(glassCard)}>
                            {isOwnMessage(message) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setEditingMessage(message.id)}
                                  className="cursor-pointer"
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="text-destructive cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Löschen
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleReaction(message.id, ReactionType.LIKE)}
                              className="cursor-pointer"
                            >
                              {getReactionEmoji(ReactionType.LIKE)}{' '}
                              {getReactionLabel(ReactionType.LIKE)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReaction(message.id, ReactionType.LOVE)}
                              className="cursor-pointer"
                            >
                              {getReactionEmoji(ReactionType.LOVE)}{' '}
                              {getReactionLabel(ReactionType.LOVE)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReaction(message.id, ReactionType.LAUGH)}
                              className="cursor-pointer"
                            >
                              {getReactionEmoji(ReactionType.LAUGH)}{' '}
                              {getReactionLabel(ReactionType.LAUGH)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReaction(message.id, ReactionType.WOW)}
                              className="cursor-pointer"
                            >
                              {getReactionEmoji(ReactionType.WOW)}{' '}
                              {getReactionLabel(ReactionType.WOW)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReaction(message.id, ReactionType.SAD)}
                              className="cursor-pointer"
                            >
                              {getReactionEmoji(ReactionType.SAD)}{' '}
                              {getReactionLabel(ReactionType.SAD)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReaction(message.id, ReactionType.ANGRY)}
                              className="cursor-pointer"
                            >
                              {getReactionEmoji(ReactionType.ANGRY)}{' '}
                              {getReactionLabel(ReactionType.ANGRY)}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
