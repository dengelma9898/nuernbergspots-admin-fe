import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChatMessageService, ChatMessage, ReactionType } from '@/services/chatMessageService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Send, Smile, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatMessages() {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const chatMessageService = useChatMessageService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
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
      const data = await chatMessageService.getMessages(chatroomId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      toast.error("Nachrichten konnten nicht geladen werden.");
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
          >
            <div className="relative max-w-[70%]">
              <div className={`${isOwnMessage(message) ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                {!isOwnMessage(message) && (
                  <div className="text-sm font-semibold mb-1">{message.senderName}</div>
                )}
                <div className="text-sm whitespace-pre-line">{message.content}</div>
                <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                  <span>
                    {format(new Date(message.createdAt), 'HH:mm', { locale: de })}
                    {message.editedAt && ' (bearbeitet)'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {isOwnMessage(message) && (
                        <>
                          <DropdownMenuItem onClick={() => setEditingMessage(message.id)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.LIKE)}>
                        {getReactionEmoji(ReactionType.LIKE)} {getReactionLabel(ReactionType.LIKE)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.LOVE)}>
                        {getReactionEmoji(ReactionType.LOVE)} {getReactionLabel(ReactionType.LOVE)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.LAUGH)}>
                        {getReactionEmoji(ReactionType.LAUGH)} {getReactionLabel(ReactionType.LAUGH)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.WOW)}>
                        {getReactionEmoji(ReactionType.WOW)} {getReactionLabel(ReactionType.WOW)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.SAD)}>
                        {getReactionEmoji(ReactionType.SAD)} {getReactionLabel(ReactionType.SAD)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReaction(message.id, ReactionType.ANGRY)}>
                        {getReactionEmoji(ReactionType.ANGRY)} {getReactionLabel(ReactionType.ANGRY)}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {message.reactions && message.reactions.length > 0 && (
                <div
                  className={`absolute left-4 -bottom-4 flex gap-1 px-2 py-1 bg-white rounded-full shadow border text-base z-10 ${isOwnMessage(message) ? 'right-4 left-auto' : ''}`}
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
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht eingeben..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 