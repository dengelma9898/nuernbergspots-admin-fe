import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { LoadingButton } from '@/components/LoadingButton';
import { ChatroomSkeleton } from '@/components/chatrooms/ChatroomSkeleton';
import { ChatroomCard } from '@/components/chatrooms/ChatroomCard';
import { ChatroomCreateDialog } from '@/components/chatrooms/ChatroomCreateDialog';
import { ChatroomEditDialog } from '@/components/chatrooms/ChatroomEditDialog';
import { ChatroomDeleteDialog } from '@/components/chatrooms/ChatroomDeleteDialog';
import { useChatroomManagement } from '@/hooks/useChatroomManagement';

export function ChatroomManagementContent() {
  const management = useChatroomManagement();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl relative z-10">
        <div className="space-y-6 sm:space-y-8">
          <motion.div
            className={cn(cardPreset, 'p-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <LoadingButton
                  variant="ghost"
                  size="icon"
                  className={cn(buttonPreset, 'rounded-full mb-2 sm:mb-0')}
                  onClick={() => management.navigate('/dashboard')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zum Dashboard</span>
                </LoadingButton>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
                  Chatroom Management
                </h1>
                <div className="text-base sm:text-lg text-muted-foreground max-w-md">
                  Verwalten Sie hier alle Chatrooms und deren Einstellungen
                </div>
              </div>
              <ChatroomCreateDialog
                open={management.isCreateDialogOpen}
                onOpenChange={management.setIsCreateDialogOpen}
                newChatroom={management.newChatroom}
                onNewChatroomChange={management.setNewChatroom}
                createError={management.createError}
                onCreateErrorChange={management.setCreateError}
                createImageUpload={management.createImageUpload}
                onImageSelect={management.handleCreateImageSelect}
                onCreate={management.handleCreateChatroom}
              />
            </div>
          </motion.div>

          <ChatroomEditDialog
            open={management.isEditDialogOpen}
            onOpenChange={open => {
              management.setIsEditDialogOpen(open);
              if (!open) {
                management.setEditError(null);
              }
            }}
            selectedChatroom={management.selectedChatroom}
            onSelectedChatroomChange={management.setSelectedChatroom}
            originalImageUrl={management.originalImageUrl}
            onOriginalImageUrlChange={management.setOriginalImageUrl}
            editError={management.editError}
            editImageUpload={management.editImageUpload}
            onImageSelect={management.handleEditImageSelect}
            onSave={management.handleEditChatroom}
          />

          <ChatroomDeleteDialog
            open={management.isDeleteDialogOpen}
            onOpenChange={management.setIsDeleteDialogOpen}
            selectedChatroom={management.selectedChatroom}
            onConfirm={management.handleDeleteChatroom}
          />

          <motion.div
            key={`chatrooms-${management.chatrooms.length}-${management.isLoading}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {management.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <ChatroomSkeleton />
                </motion.div>
              ))
            ) : management.chatrooms.length === 0 ? (
              <motion.div
                className="col-span-full"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={defaultTransition}
              >
                <Card className={cn(cardPreset, 'p-8 text-center')}>
                  <div className="text-muted-foreground text-lg">
                    Keine Chatrooms vorhanden. Erstellen Sie einen neuen Chatroom!
                  </div>
                </Card>
              </motion.div>
            ) : (
              management.chatrooms.map(chatroom => (
                <motion.div key={chatroom.id} variants={fadeInUp}>
                  <ChatroomCard
                    chatroom={chatroom}
                    onClick={() => management.handleChatroomClick(chatroom.id)}
                    onEdit={e => management.openEditDialog(chatroom, e)}
                    onDelete={e => management.openDeleteDialog(chatroom, e)}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
