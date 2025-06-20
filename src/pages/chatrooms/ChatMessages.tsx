import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatMessageService, ChatMessage, ReactionType } from '@/services/chatMessageService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Send, Smile, MoreVertical, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

function ChatMessageSkeleton({ isOwnMessage = false }: { isOwnMessage?: boolean }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-[70%]">
        <div className={`${isOwnMessage ? 'backdrop-blur-2xl bg-white/20 border-white/30' : 'backdrop-blur-2xl bg-white/10 border-white/20'} rounded-lg p-3 border shadow-lg`}>
          {!isOwnMessage && (
            <Skeleton className="h-4 w-20 mb-1 bg-white/10 backdrop-blur-xl rounded" />
          )}
          <div className="space-y-1">
            <Skeleton className="h-4 w-full bg-white/10 backdrop-blur-xl rounded" />
            <Skeleton className="h-4 w-3/4 bg-white/10 backdrop-blur-xl rounded" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <Skeleton className="h-3 w-12 bg-white/10 backdrop-blur-xl rounded" />
            <Skeleton className="h-6 w-6 rounded-lg bg-white/10 backdrop-blur-xl" />
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
      toast.error("Chatroom ID fehlt");
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
      toast.error("Nachrichten konnten nicht geladen werden.");
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
      if (!userProfile || !userProfile.name) throw new Error('Benutzerprofil konnte nicht geladen werden');
      const message = await chatMessageService.createMessage(chatroomId, {
        content: newMessage,
        senderId: userId,
        senderName: userProfile.name
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      if (error instanceof Error) {
        toast.error(`Nachricht konnte nicht gesendet werden: ${error.message}`);
      } else {
        toast.error("Nachricht konnte nicht gesendet werden.");
      }
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
      const updatedMessage = await chatMessageService.updateMessage(chatroomId!, messageId, { content });
      setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
      setEditingMessage(null);
    } catch (error) {
      toast.error("Nachricht konnte nicht bearbeitet werden.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatMessageService.deleteMessage(chatroomId!, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      toast.error("Nachricht konnte nicht gelöscht werden.");
    }
  };

  const handleReaction = async (messageId: string, type: ReactionType) => {
    try {
      const updatedMessage = await chatMessageService.addReaction(chatroomId!, messageId, { type });
      setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
    } catch (error) {
      toast.error("Reaktion konnte nicht hinzugefügt werden.");
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
      <div className="flex flex-col h-[calc(100vh-4rem)] relative z-10">
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl m-4 p-4 border border-white/10 shadow-2xl ring-1 ring-white/20">
        <Button
          variant="ghost"
          onClick={() => navigate('/chatrooms')}
          className="flex items-center gap-2 backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Chatrooms
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-xl bg-white/5 mx-4 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20">
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
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative max-w-[70%]">
                <div className={`${isOwnMessage(message) ? 'backdrop-blur-2xl bg-white/20 text-white border-white/30' : 'backdrop-blur-2xl bg-white/10 text-white border-white/20'} rounded-lg p-3 border shadow-lg`}>
                  {!isOwnMessage(message) && (
                    <div className="text-sm font-semibold mb-1 text-white/90">{message.senderName}</div>
                  )}
                  <div className="text-sm whitespace-pre-line text-white">{message.content}</div>
                  <div className="flex items-center justify-between mt-1 text-xs text-white/60">
                    <span>
                      {format(new Date(message.createdAt), 'HH:mm', { locale: de })}
                      {message.editedAt && ' (bearbeitet)'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 backdrop-blur-xl bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 transition-all duration-300 text-white hover:scale-110 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
                                                {isOwnMessage(message) && (
                          <>
                            <DropdownMenuItem onClick={() => setEditingMessage(message.id)} className="text-white hover:bg-white/20 cursor-pointer">
                              <Edit2 className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)} className="text-red-300 hover:bg-red-500/20 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Löschen
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.LIKE)} className="text-white hover:bg-white/20 cursor-pointer">
                          {getReactionEmoji(ReactionType.LIKE)} {getReactionLabel(ReactionType.LIKE)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.LOVE)} className="text-white hover:bg-white/20 cursor-pointer">
                          {getReactionEmoji(ReactionType.LOVE)} {getReactionLabel(ReactionType.LOVE)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.LAUGH)} className="text-white hover:bg-white/20 cursor-pointer">
                          {getReactionEmoji(ReactionType.LAUGH)} {getReactionLabel(ReactionType.LAUGH)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.WOW)} className="text-white hover:bg-white/20 cursor-pointer">
                          {getReactionEmoji(ReactionType.WOW)} {getReactionLabel(ReactionType.WOW)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.SAD)} className="text-white hover:bg-white/20 cursor-pointer">
                          {getReactionEmoji(ReactionType.SAD)} {getReactionLabel(ReactionType.SAD)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.ANGRY)} className="text-white hover:bg-white/20 cursor-pointer">
                          {getReactionEmoji(ReactionType.ANGRY)} {getReactionLabel(ReactionType.ANGRY)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {message.reactions && message.reactions.length > 0 && (
                  <div
                    className={`absolute left-4 -bottom-4 flex gap-1 px-2 py-1 backdrop-blur-2xl bg-white/20 rounded-full shadow-lg border border-white/30 text-base z-10 ${isOwnMessage(message) ? 'right-4 left-auto' : ''}`}
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
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="backdrop-blur-3xl bg-white/5 rounded-3xl m-4 p-4 border border-white/10 shadow-2xl ring-1 ring-white/20">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht eingeben..."
            className="flex-1 backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
          />
          <Button 
            onClick={handleSendMessage}
            className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl bg-primary"
            data-testid="send-button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
} 