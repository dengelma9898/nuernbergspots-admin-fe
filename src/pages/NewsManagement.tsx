import React, { useState, useRef, useEffect } from 'react';
import { useNewsService } from '@/services/newsService';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem } from '@/models/news';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  UserCircle,
  Image as ImageIcon,
  BarChart2,
  RefreshCw,
  Send,
  Trash2,
  ArrowLeft,
  Plus,
  X,
  Edit,
} from 'lucide-react';
import { formatDistanceToNow, format, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

const NewsSkeletonBubble: React.FC<{ type?: 'text' | 'image' | 'poll' }> = ({ type = 'text' }) => {
  return (
    <Card className={cn(glassCard, 'w-full')}>
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-16 rounded" />
        </div>

        {/* Content based on type */}
        {type === 'text' && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        )}

        {type === 'image' && (
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {[...Array(3)].map((_, idx) => (
                <Skeleton key={idx} className="w-24 h-24 rounded-xl" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
        )}

        {type === 'poll' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className={cn(glassCard, 'flex justify-between items-center p-3')}
                >
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        )}

        {/* Reactions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[...Array(2)].map((_, idx) => (
            <Skeleton key={idx} className="h-6 w-12 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MonthHeader: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="sticky top-0 z-20 py-3 mb-2">
      <h2 className="text-base md:text-lg font-semibold text-muted-foreground capitalize">
        {label}
      </h2>
    </div>
  );
};

const NewsBubble: React.FC<{ item: NewsItem; onEdit: (item: NewsItem) => void; index?: number }> = ({
  item,
  onEdit,
  index = 0,
}) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ ...defaultTransition, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(glassCard, 'w-full')}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {item.authorImageUrl ? (
                <img
                  src={item.authorImageUrl}
                  alt={item.authorName}
                  className="w-8 h-8 rounded-full object-cover border border-secondary"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="font-semibold text-sm text-foreground">
                {item.authorName || 'Unbekannt'}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(item.type === 'text' || item.type === 'image') && (
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className={cn(glassButton, 'flex items-center gap-2')}
                >
                  <Edit className="w-4 h-4" />
                  <span>Bearbeiten</span>
                </AnimatedButton>
              )}
              <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: de })}
            </span>
          </div>
        </div>

        {/* Content */}
        {item.type === 'text' && (
          <div className="text-base leading-relaxed py-2 text-foreground">
            {(item as TextNewsItem).content}
          </div>
        )}

        {item.type === 'image' && (
          <div>
            <div className="flex gap-3 py-2 flex-wrap">
              {(item as ImageNewsItem).imageUrls.map((url, idx) => (
                <img
                  key={url}
                  src={url}
                  alt={`Bild ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-xl border border-secondary shadow-lg"
                />
              ))}
            </div>
            <div className="text-base leading-relaxed py-1 text-foreground">
              {(item as ImageNewsItem).content}
            </div>
          </div>
        )}

        {item.type === 'poll' && (
          <div className="py-2">
            <div className="font-medium mb-3 flex items-center gap-2 text-foreground">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              {(item as PollNewsItem).question}
            </div>
            <div className="flex flex-col gap-2">
              {(item as PollNewsItem).options.map(opt => (
                <div
                  key={opt.id}
                  className={cn(glassCard, 'flex justify-between items-center w-full p-3')}
                >
                  <span className="text-foreground">{opt.text}</span>
                  <Badge variant="secondary">
                    {opt.voters.length}
                  </Badge>
                </div>
              ))}
            </div>
            {item.expiresAt && (
              <div className="text-xs text-muted-foreground mt-2">
                Läuft ab: {new Date(item.expiresAt).toLocaleString('de-DE')}
              </div>
            )}
          </div>
        )}

        {/* Reactions */}
        {item.reactions && item.reactions.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {Array.from(new Set(item.reactions.map(r => r.type))).map(type => (
              <Badge
                key={type}
                variant="outline"
                className="flex items-center gap-1"
              >
                <span>{type}</span>
                <span className="text-xs">
                  {item.reactions?.filter(r => r.type === type).length}
                </span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};

const MAX_IMAGES = 5;

const NewsManagement: React.FC = () => {
  const newsService = useNewsService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [imageContent, setImageContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageSending, setImageSending] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [pollExpiresAt, setPollExpiresAt] = useState<string>('');
  const [pollSending, setPollSending] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [editTextContent, setEditTextContent] = useState('');
  const [editImageContent, setEditImageContent] = useState('');
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const allNews = await newsService.getAll();
      setNews(
        allNews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
      setTimeout(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'auto' });
      }, 100);
    } catch (e) {
      // Fehlerbehandlung
    } finally {
      setLoading(false);
    }
  };

  // Gruppiere News nach Monat/Jahr
  const groupedNewsByMonth = news.reduce((acc, item) => {
    const createdAt = new Date(item.createdAt);
    const monthKey = format(startOfMonth(createdAt), 'yyyy-MM', { locale: de });
    const monthLabel = format(startOfMonth(createdAt), 'MMMM yyyy', { locale: de });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        label: monthLabel,
        date: createdAt,
        items: [],
      };
    }

    acc[monthKey].items.push(item);
    return acc;
  }, {} as Record<string, { label: string; date: Date; items: NewsItem[] }>);

  // Sortiere die Monate absteigend (neueste zuerst)
  const sortedMonthGroups = Object.values(groupedNewsByMonth).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const authorId = getUserId();
      if (!authorId) throw new Error('Kein User eingeloggt');
      await newsService.createTextNews({ content: input, authorId });
      setInput('');
      await fetchNews();
      setTimeout(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (e) {
      // Fehlerbehandlung
    } finally {
      setSending(false);
    }
  };

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES - imageFiles.length);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendImageNews = async () => {
    if (!imageContent.trim() || imageFiles.length === 0) return;
    setImageSending(true);
    try {
      const authorId = getUserId();
      if (!authorId) throw new Error('Kein User eingeloggt');
      // 1. ImageNews ohne Bilder anlegen
      const created = await newsService.createImageNews({
        content: imageContent,
        imageUrls: [],
        authorId,
      });
      // 2. Bilder hochladen
      await newsService.updateNewsImages(created.id, imageFiles);
      setShowImageModal(false);
      setImageContent('');
      setImageFiles([]);
      setImagePreviews([]);
      await fetchNews();
      setTimeout(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (e) {
      // Fehlerbehandlung
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
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())) return;
    setPollSending(true);
    try {
      const authorId = getUserId();
      if (!authorId) throw new Error('Kein User eingeloggt');

      const pollData = {
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
      };

      await newsService.createPollNews(pollData);
      setShowPollModal(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setAllowMultipleAnswers(false);
      setPollExpiresAt('');
      await fetchNews();
      setTimeout(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (e) {
      // Fehlerbehandlung
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
    if (!editingItem) return;
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
      await fetchNews();
    } catch (e) {
      // Fehlerbehandlung
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveImageFromEdit = (imageUrl: string) => {
    setEditImageUrls(prev => prev.filter(url => url !== imageUrl));
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <div className="flex flex-col min-h-screen w-full relative z-10">
          {/* Header Section */}
          <motion.div
            className={cn(glassCard, 'mx-2 mt-4 mb-6 p-4 md:p-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  title="Zurück zum Dashboard"
                  className={cn(glassButton, 'rounded-xl')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </AnimatedButton>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  News Management
                </h1>
            </div>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={fetchNews}
                  title="Neu laden"
                  className={cn(glassButton, 'rounded-xl')}
                >
                  <RefreshCw className={loading ? 'animate-spin' : ''} />
                </AnimatedButton>
              </div>
            </motion.div>
            {/* News Feed */}
            <div
              ref={feedRef}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32 px-2"
              style={{ scrollBehavior: 'smooth', minHeight: 0 }}
            >
              {loading ? (
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {/* Mixed skeleton types for realistic loading */}
                  <NewsSkeletonBubble type="text" />
                  <NewsSkeletonBubble type="image" />
                  <NewsSkeletonBubble type="poll" />
                  <NewsSkeletonBubble type="text" />
                  <NewsSkeletonBubble type="image" />
                </motion.div>
              ) : news.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={defaultTransition}
                >
                  <Card className={cn(glassCard, 'p-8')}>
                    <div className="text-center text-muted-foreground text-lg">
                      Noch keine News vorhanden. Klicke auf das Refresh-Icon zum Laden.
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {sortedMonthGroups.map(group => (
                    <div key={group.label} className="space-y-4">
                      <MonthHeader label={group.label} />
                      {group.items.map((item, index) => (
                        <NewsBubble key={item.id} item={item} onEdit={handleEdit} index={index} />
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            {/* Fixed Bottom Input Bar */}
            <motion.form
              className={cn(glassCard, 'fixed bottom-0 left-0 w-full z-30 border-t p-4')}
              style={{ maxWidth: '100vw' }}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
            >
              <div className="flex flex-col gap-3">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Neue Nachricht schreiben..."
                  disabled={sending}
                  className={cn(glassInput, 'w-full')}
                  autoFocus
                />
                <div className="flex gap-2 w-full">
                  <LoadingButton
                    type="submit"
                    disabled={sending || !input.trim()}
                    isLoading={sending}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </LoadingButton>
                  <AnimatedButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageModal(true)}
                    title="Bild-News hinzufügen"
                    className={cn(glassButton, 'flex-1')}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </AnimatedButton>
                  <AnimatedButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPollModal(true)}
                    title="Umfrage erstellen"
                    className={cn(glassButton, 'flex-1')}
                  >
                    <BarChart2 className="w-4 h-4" />
                  </AnimatedButton>
                </div>
              </div>
            </motion.form>
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
              <DialogContent className={cn(glassCard)}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Bild-News erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={imageContent}
                    onChange={e => setImageContent(e.target.value)}
                    placeholder="Text zur Bild-News..."
                    disabled={imageSending}
                    className={cn(glassInput)}
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={imageFiles.length >= MAX_IMAGES || imageSending}
                      onChange={handleImageFiles}
                      className="hidden"
                      id="image-upload-input"
                    />
                    <AnimatedButton
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(glassButton, 'mb-3')}
                      disabled={imageFiles.length >= MAX_IMAGES || imageSending}
                    >
                      <label htmlFor="image-upload-input" className="cursor-pointer">
                        {imageFiles.length >= MAX_IMAGES ? 'Maximal 5 Bilder' : 'Bilder auswählen'}
                      </label>
                    </AnimatedButton>
                    <div className="flex gap-3 flex-wrap">
                      {imagePreviews.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 border border-secondary rounded-xl overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <AnimatedButton
                            type="button"
                            size="icon"
                            className="absolute -top-1 -right-1 w-6 h-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full"
                            onClick={() => handleRemoveImage(idx)}
                            disabled={imageSending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </AnimatedButton>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      disabled={imageSending}
                      className={cn(glassButton)}
                    >
                      Abbrechen
                    </AnimatedButton>
                  </DialogClose>
                  <LoadingButton
                    onClick={handleSendImageNews}
                    disabled={imageSending || !imageContent.trim() || imageFiles.length === 0}
                    isLoading={imageSending}
                    loadingText="Wird gesendet..."
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    Senden
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showPollModal} onOpenChange={setShowPollModal}>
              <DialogContent className={cn(glassCard, 'max-w-lg')}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Umfrage erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="poll-question" className="text-foreground">
                      Frage
                    </Label>
                    <Input
                      id="poll-question"
                      value={pollQuestion}
                      onChange={e => setPollQuestion(e.target.value)}
                      placeholder="Stelle deine Frage..."
                      disabled={pollSending}
                      className={cn(glassInput)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground">Antwortmöglichkeiten</Label>
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={e => handlePollOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          disabled={pollSending}
                          className={cn(glassInput)}
                        />
                        {pollOptions.length > 2 && (
                          <AnimatedButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePollOption(index)}
                            disabled={pollSending}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </AnimatedButton>
                        )}
                      </div>
                    ))}
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPollOption}
                      disabled={pollSending || pollOptions.length >= 10}
                      className={cn(glassButton, 'w-full')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Option hinzufügen
                    </AnimatedButton>
                  </div>

                  <div className={cn(glassCard, 'flex items-center space-x-3 p-3')}>
                    <Switch
                      id="multiple-answers"
                      checked={allowMultipleAnswers}
                      onCheckedChange={setAllowMultipleAnswers}
                      disabled={pollSending}
                    />
                    <Label htmlFor="multiple-answers" className="text-foreground">
                      Mehrfachauswahl erlauben
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poll-expires" className="text-foreground">
                      Ablaufdatum (optional)
                    </Label>
                    <Input
                      id="poll-expires"
                      type="datetime-local"
                      value={pollExpiresAt}
                      onChange={e => setPollExpiresAt(e.target.value)}
                      disabled={pollSending}
                      className={cn(glassInput)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      disabled={pollSending}
                      className={cn(glassButton)}
                    >
                      Abbrechen
                    </AnimatedButton>
                  </DialogClose>
                  <LoadingButton
                    onClick={handleSendPoll}
                    disabled={
                      pollSending || !pollQuestion.trim() || pollOptions.some(opt => !opt.trim())
                    }
                    isLoading={pollSending}
                    loadingText="Wird erstellt..."
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    Umfrage erstellen
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Edit Text News Dialog */}
            <Dialog open={editingItem?.type === 'text'} onOpenChange={open => !open && setEditingItem(null)}>
              <DialogContent className={cn(glassCard)}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Text-News bearbeiten</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={editTextContent}
                    onChange={e => setEditTextContent(e.target.value)}
                    placeholder="Text bearbeiten..."
                    disabled={editSaving}
                    className={cn(glassInput, 'min-h-[150px]')}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      disabled={editSaving}
                      className={cn(glassButton)}
                    >
                      Abbrechen
                    </AnimatedButton>
                  </DialogClose>
                  <LoadingButton
                    onClick={handleSaveEdit}
                    disabled={editSaving || !editTextContent.trim()}
                    isLoading={editSaving}
                    loadingText="Wird gespeichert..."
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    Speichern
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Edit Image News Dialog */}
            <Dialog
              open={editingItem?.type === 'image'}
              onOpenChange={open => !open && setEditingItem(null)}
            >
              <DialogContent className={cn(glassCard, 'max-w-2xl')}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Bild-News bearbeiten</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-content" className="text-foreground">
                      Text
                    </Label>
                    <Textarea
                      id="edit-image-content"
                      value={editImageContent}
                      onChange={e => setEditImageContent(e.target.value)}
                      placeholder="Text bearbeiten..."
                      disabled={editSaving}
                      className={cn(glassInput)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Bilder</Label>
                    {editImageUrls.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {editImageUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`Bild ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-xl border border-secondary"
                            />
                            <AnimatedButton
                              type="button"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full h-7 w-7"
                              onClick={() => handleRemoveImageFromEdit(url)}
                              disabled={editSaving}
                              title="Bild entfernen"
                            >
                              <X className="w-4 h-4" />
                            </AnimatedButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className={cn(glassCard, 'text-center py-8')}>
                        <div className="text-muted-foreground">Keine Bilder vorhanden</div>
                      </Card>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      disabled={editSaving}
                      className={cn(glassButton)}
                    >
                      Abbrechen
                    </AnimatedButton>
                  </DialogClose>
                  <LoadingButton
                    onClick={handleSaveEdit}
                    disabled={editSaving || !editImageContent.trim()}
                    isLoading={editSaving}
                    loadingText="Wird gespeichert..."
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    Speichern
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </PageTransition>
    );
  };

export default NewsManagement;
