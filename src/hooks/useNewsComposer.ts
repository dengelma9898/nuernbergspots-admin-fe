import { useState } from 'react';
import { toast } from 'sonner';
import { NewsItem, TextNewsItem, ImageNewsItem } from '@/models/news';
import { useNewsService } from '@/services/newsService';
import { useValidatedImageUpload } from '@/hooks/useValidatedImageUpload';
import { showUserFriendlyError } from '@/utils/errorUtils';

const MAX_IMAGES = 5;

interface UseNewsComposerOptions {
  getUserId: () => string | null;
  onNewsChanged: (scrollBehavior?: ScrollBehavior) => Promise<void>;
}

export function useNewsComposer({ getUserId, onNewsChanged }: UseNewsComposerOptions) {
  const newsService = useNewsService();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [imageContent, setImageContent] = useState('');
  const [imageSending, setImageSending] = useState(false);
  const imageUpload = useValidatedImageUpload({
    maxImages: MAX_IMAGES,
    maxSizeMB: 5,
  });
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [pollExpiresAt, setPollExpiresAt] = useState('');
  const [pollSending, setPollSending] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [editTextContent, setEditTextContent] = useState('');
  const [editImageContent, setEditImageContent] = useState('');
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const authorId = getUserId();
      if (!authorId) throw new Error('Kein User eingeloggt');
      await newsService.createTextNews({ content: input, authorId });
      setInput('');
      await onNewsChanged('smooth');
    } catch (e) {
      console.error('Fehler beim Senden der Text-News:', e);
      showUserFriendlyError(e, toast, () => handleSend(), 'save-news');
    } finally {
      setSending(false);
    }
  };

  const handleSendImageNews = async () => {
    if (!imageContent.trim() || imageUpload.files.length === 0 || imageSending) return;
    setImageSending(true);
    try {
      const authorId = getUserId();
      if (!authorId) throw new Error('Kein User eingeloggt');
      const created = await newsService.createImageNews({
        content: imageContent,
        imageUrls: [],
        authorId,
      });
      await newsService.updateNewsImages(created.id, imageUpload.files);
      setShowImageModal(false);
      setImageContent('');
      imageUpload.clearImages();
      await onNewsChanged('smooth');
    } catch (e) {
      console.error('Fehler beim Senden der Bild-News:', e);
      showUserFriendlyError(e, toast, () => handleSendImageNews(), 'save-news');
    } finally {
      setImageSending(false);
    }
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSendPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim()) || pollSending) return;
    setPollSending(true);
    try {
      const authorId = getUserId();
      if (!authorId) throw new Error('Kein User eingeloggt');

      await newsService.createPollNews({
        content: pollQuestion,
        authorId,
        pollInfo: {
          options: pollOptions.map(text => ({
            id: crypto.randomUUID(),
            text,
            voters: [],
          })),
          allowMultipleChoices: allowMultipleAnswers,
          endDate: pollExpiresAt || null,
          votes: null,
        },
      });
      setShowPollModal(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setAllowMultipleAnswers(false);
      setPollExpiresAt('');
      await onNewsChanged('smooth');
    } catch (e) {
      console.error('Fehler beim Senden der Umfrage:', e);
      showUserFriendlyError(e, toast, () => handleSendPoll(), 'save-news');
    } finally {
      setPollSending(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    if (item.type === 'text') {
      setEditTextContent((item as TextNewsItem).content);
    } else if (item.type === 'image') {
      setEditImageContent((item as ImageNewsItem).content);
      setEditImageUrls([...(item as ImageNewsItem).imageUrls]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem || editSaving) return;
    setEditSaving(true);
    try {
      if (editingItem.type === 'text') {
        await newsService.update(editingItem.id, {
          content: editTextContent,
        } as Partial<TextNewsItem>);
      } else if (editingItem.type === 'image') {
        await newsService.update(editingItem.id, {
          content: editImageContent,
          imageUrls: editImageUrls,
        } as Partial<ImageNewsItem>);
      }
      setEditingItem(null);
      setEditTextContent('');
      setEditImageContent('');
      setEditImageUrls([]);
      await onNewsChanged();
    } catch (e) {
      console.error('Fehler beim Speichern der Bearbeitung:', e);
      showUserFriendlyError(e, toast, () => handleSaveEdit(), 'save-news');
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveImageFromEdit = (imageUrl: string) => {
    setEditImageUrls(prev => prev.filter(url => url !== imageUrl));
  };

  const closeImageModal = (open: boolean) => {
    setShowImageModal(open);
    if (!open) {
      setImageContent('');
      imageUpload.clearImages();
    }
  };

  return {
    maxImages: MAX_IMAGES,
    input,
    setInput,
    sending,
    showImageModal,
    setShowImageModal: closeImageModal,
    showPollModal,
    setShowPollModal,
    imageContent,
    setImageContent,
    imageSending,
    imageUpload,
    pollQuestion,
    setPollQuestion,
    pollOptions,
    allowMultipleAnswers,
    setAllowMultipleAnswers,
    pollExpiresAt,
    setPollExpiresAt,
    pollSending,
    editingItem,
    setEditingItem,
    editTextContent,
    setEditTextContent,
    editImageContent,
    setEditImageContent,
    editImageUrls,
    editSaving,
    handleSend,
    handleSendImageNews,
    handleAddPollOption,
    handleRemovePollOption,
    handlePollOptionChange,
    handleSendPoll,
    handleEdit,
    handleSaveEdit,
    handleRemoveImageFromEdit,
  };
}
