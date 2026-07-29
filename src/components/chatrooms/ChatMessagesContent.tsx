import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion, AnimatePresence } from '@/components/motion';
import { fadeInUp, slideInRight, defaultTransition } from '@/lib/animations';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

import { ReactionType } from '@/services/chatMessageService';
import { LoadingButton } from '@/components/LoadingButton';
import { ChatMessagesLoadingSkeleton } from '@/components/chatrooms/ChatMessagesSkeletons';
import { useChatMessages } from '@/hooks/useChatMessages';

import { Send, MoreVertical, Edit2, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';

function getReactionEmoji(type: ReactionType): string {
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
}

function getReactionLabel(type: ReactionType): string {
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
}

export function ChatMessagesContent() {
  const {
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
  } = useChatMessages();

  return (
    <div className="min-h-screen relative overflow-hidden w-full max-w-full">
      <div className="flex flex-col h-[calc(100vh-4rem)] relative z-10 w-full max-w-full overflow-x-hidden">
        <motion.div
          className={cn(cardPreset, 'm-4 p-4')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <LoadingButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/chatrooms')}
                className={cn(buttonPreset, 'rounded-full flex-shrink-0')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zu Chatrooms</span>
              </LoadingButton>
              <h1 className="text-xl font-semibold text-foreground truncate">
                {chatroomName || 'Lädt...'}
              </h1>
            </div>
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(buttonPreset, 'rounded-full flex-shrink-0')}
              title="Aktualisieren"
            >
              <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
              <span className="sr-only">Aktualisieren</span>
            </LoadingButton>
          </div>
        </motion.div>
        <motion.div
          className={cn(cardPreset, 'flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 mx-4')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.1 }}
          style={{ overflowX: 'hidden' }}
        >
          {isLoading ? (
            <ChatMessagesLoadingSkeleton />
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
                <div
                  className="relative max-w-[70%] min-w-0 flex-shrink-0"
                  style={{ overflow: 'visible' }}
                >
                  {editingMessage === message.id ? (
                    <>
                      <div
                        className={cn(cardPreset, 'rounded-lg p-3')}
                        style={{ overflow: 'visible' }}
                      >
                        <Input
                          defaultValue={message.content}
                          onKeyDown={e => {
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
                          className={cn(inputPreset, 'w-full')}
                          onBlur={e => {
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
                            onClick={e => {
                              const input = e.currentTarget
                                .closest('.rounded-lg')
                                ?.querySelector('input') as HTMLInputElement;
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
                          className={cn(
                            cardPreset,
                            `absolute left-4 -bottom-4 flex gap-1 px-2 py-1 rounded-full text-base z-10`,
                            isOwnMessage(message) ? 'right-4 left-auto' : ''
                          )}
                          style={{ minHeight: '28px' }}
                        >
                          {message.reactions.map((reaction, reactionIndex) => (
                            <span key={reactionIndex} className="text-xs">
                              {getReactionEmoji(reaction.type as ReactionType)}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div
                        className={cn(cardPreset, 'rounded-lg p-3')}
                        style={{ overflow: 'visible' }}
                      >
                        {!isOwnMessage(message) && (
                          <div className="text-sm font-semibold mb-1 text-foreground">
                            {message.senderName}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-line text-foreground break-words">
                          {message.content}
                        </div>
                        <div
                          className="flex items-center justify-between mt-1 text-xs text-muted-foreground min-w-0 gap-2 relative"
                          style={{ overflow: 'visible' }}
                        >
                          <span className="truncate min-w-0 flex-1">
                            {format(new Date(message.createdAt), 'HH:mm', { locale: de })}
                            {message.editedAt &&
                              (message.editedByAdmin ? ' (von Admin bearbeitet)' : ' (bearbeitet)')}
                          </span>
                          <div
                            className="flex-shrink-0 relative"
                            style={{ zIndex: openMenuId === message.id ? 1000 : 'auto' }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0 hover:bg-accent/50 transition-all duration-200"
                              onClick={e => {
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
                                    boxShadow:
                                      '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                  }}
                                  onClick={e => e.stopPropagation()}
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
                          className={cn(
                            cardPreset,
                            `absolute left-4 -bottom-4 flex gap-1 px-2 py-1 rounded-full text-base z-10`,
                            isOwnMessage(message) ? 'right-4 left-auto' : ''
                          )}
                          style={{ minHeight: '28px' }}
                        >
                          {message.reactions.map((reaction, reactionIndex) => (
                            <span key={reactionIndex} className="text-xs">
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
          className={cn(cardPreset, 'm-4 p-4')}
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
              className={cn(inputPreset, 'flex-1')}
            />
            <LoadingButton
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              data-testid="send-button"
            >
              <Send className="h-4 w-4" />
            </LoadingButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
