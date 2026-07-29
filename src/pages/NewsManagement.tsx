import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/animations';
import { cardPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useNewsComposer } from '@/hooks/useNewsComposer';
import { NewsSkeletonBubble } from '@/components/news/NewsSkeletonBubble';
import { NewsFeedHeader } from '@/components/news/NewsFeedHeader';
import { NewsMonthHeader } from '@/components/news/NewsMonthHeader';
import { NewsBubble } from '@/components/news/NewsBubble';
import { NewsComposerBar } from '@/components/news/NewsComposerBar';
import { NewsCreateImageDialog } from '@/components/news/NewsCreateImageDialog';
import { NewsCreatePollDialog } from '@/components/news/NewsCreatePollDialog';
import { NewsEditTextDialog } from '@/components/news/NewsEditTextDialog';
import { NewsEditImageDialog } from '@/components/news/NewsEditImageDialog';
import { NewsDeleteDialog } from '@/components/news/NewsDeleteDialog';

const NewsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const feed = useNewsFeed();
  const composer = useNewsComposer({
    getUserId,
    onNewsChanged: feed.fetchNews,
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="flex flex-col min-h-screen w-full relative z-10">
        <NewsFeedHeader
          loading={feed.loading}
          onBack={() => navigate('/dashboard')}
          onRefresh={() => feed.fetchNews()}
        />

        <div
          ref={feed.feedRef}
          className="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-visible pb-32 px-4"
          style={{ scrollBehavior: 'smooth', minHeight: 0 }}
        >
          {feed.loading ? (
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <NewsSkeletonBubble type="text" />
              <NewsSkeletonBubble type="image" />
              <NewsSkeletonBubble type="poll" />
              <NewsSkeletonBubble type="text" />
              <NewsSkeletonBubble type="image" />
            </motion.div>
          ) : feed.news.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(cardPreset, 'p-8')}>
                <div className="text-center text-muted-foreground text-lg">
                  Noch keine News vorhanden. Klicke auf das Refresh-Icon zum Laden.
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key={`news-${feed.news.length}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {feed.sortedMonthGroups.map(group => (
                <div key={group.label} className="space-y-4">
                  <NewsMonthHeader label={group.label} />
                  {group.items.map(item => (
                    <NewsBubble
                      key={item.id}
                      item={item}
                      onEdit={composer.handleEdit}
                      onDelete={feed.setDeletingItem}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <NewsComposerBar
          input={composer.input}
          sending={composer.sending}
          onInputChange={composer.setInput}
          onSend={composer.handleSend}
          onOpenImageModal={() => composer.setShowImageModal(true)}
          onOpenPollModal={() => composer.setShowPollModal(true)}
        />

        <NewsCreateImageDialog
          open={composer.showImageModal}
          onOpenChange={composer.setShowImageModal}
          imageContent={composer.imageContent}
          onImageContentChange={composer.setImageContent}
          imageSending={composer.imageSending}
          maxImages={composer.maxImages}
          imageUpload={composer.imageUpload}
          onSend={composer.handleSendImageNews}
        />

        <NewsCreatePollDialog
          open={composer.showPollModal}
          onOpenChange={composer.setShowPollModal}
          pollQuestion={composer.pollQuestion}
          onPollQuestionChange={composer.setPollQuestion}
          pollOptions={composer.pollOptions}
          allowMultipleAnswers={composer.allowMultipleAnswers}
          onAllowMultipleAnswersChange={composer.setAllowMultipleAnswers}
          pollExpiresAt={composer.pollExpiresAt}
          onPollExpiresAtChange={composer.setPollExpiresAt}
          pollSending={composer.pollSending}
          onAddOption={composer.handleAddPollOption}
          onRemoveOption={composer.handleRemovePollOption}
          onOptionChange={composer.handlePollOptionChange}
          onSend={composer.handleSendPoll}
        />

        <NewsEditTextDialog
          open={composer.editingItem?.type === 'text'}
          onOpenChange={open => !open && composer.setEditingItem(null)}
          editTextContent={composer.editTextContent}
          onEditTextContentChange={composer.setEditTextContent}
          editSaving={composer.editSaving}
          onSave={composer.handleSaveEdit}
        />

        <NewsEditImageDialog
          open={composer.editingItem?.type === 'image'}
          onOpenChange={open => !open && composer.setEditingItem(null)}
          editImageContent={composer.editImageContent}
          onEditImageContentChange={composer.setEditImageContent}
          editImageUrls={composer.editImageUrls}
          editSaving={composer.editSaving}
          onRemoveImage={composer.handleRemoveImageFromEdit}
          onSave={composer.handleSaveEdit}
        />

        <NewsDeleteDialog
          item={feed.deletingItem}
          deleting={feed.deleting}
          onOpenChange={open => !open && feed.setDeletingItem(null)}
          onConfirm={feed.handleDelete}
        />
      </div>
    </div>
  );
};

export default NewsManagement;
