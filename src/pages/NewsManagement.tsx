import React, { useState, useRef, useEffect } from 'react';
import { useNewsService } from '@/services/newsService';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem, PollOption } from '@/models/news';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

const NewsSkeletonBubble: React.FC<{ type?: 'text' | 'image' | 'poll' }> = ({ type = 'text' }) => {
  return (
    <Card className="w-full backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl rounded-3xl ring-1 ring-white/30">
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="bg-white/10 backdrop-blur-xl w-8 h-8 rounded-full" />
            <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-24 rounded" />
          </div>
          <Skeleton className="bg-white/10 backdrop-blur-xl h-3 w-16 rounded" />
        </div>

        {/* Content based on type */}
        {type === 'text' && (
          <div className="space-y-2">
            <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-full rounded" />
            <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-5/6 rounded" />
            <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-3/4 rounded" />
          </div>
        )}

        {type === 'image' && (
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {[...Array(3)].map((_, idx) => (
                <Skeleton key={idx} className="bg-white/10 backdrop-blur-xl w-24 h-24 rounded-xl" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-full rounded" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-2/3 rounded" />
            </div>
          </div>
        )}

        {type === 'poll' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="bg-white/10 backdrop-blur-xl w-4 h-4 rounded" />
              <Skeleton className="bg-white/10 backdrop-blur-xl h-5 w-48 rounded" />
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-xl border border-white/20"
                >
                  <Skeleton className="bg-white/10 backdrop-blur-xl h-4 w-32 rounded" />
                  <Skeleton className="bg-white/10 backdrop-blur-xl h-6 w-8 rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="bg-white/10 backdrop-blur-xl h-3 w-40 rounded" />
          </div>
        )}

        {/* Reactions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[...Array(2)].map((_, idx) => (
            <Skeleton key={idx} className="bg-white/10 backdrop-blur-xl h-6 w-12 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const NewsBubble: React.FC<{ item: NewsItem }> = ({ item }) => {
  return (
    <Card className="w-full backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 rounded-3xl ring-1 ring-white/30 hover:ring-white/40">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {item.authorImageUrl ? (
              <img
                src={item.authorImageUrl}
                alt={item.authorName}
                className="w-8 h-8 rounded-full object-cover border border-white/30 ring-2 ring-white/20"
              />
            ) : (
              <UserCircle className="w-8 h-8 text-white/70" />
            )}
            <span className="font-semibold text-sm text-white">
              {item.authorName || 'Unbekannt'}
            </span>
          </div>
          <span className="text-xs text-white/60">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: de })}
          </span>
        </div>

        {/* Content */}
        {item.type === 'text' && (
          <div className="text-base leading-relaxed py-2 text-white">
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
                  className="w-24 h-24 object-cover rounded-xl border border-white/30 ring-2 ring-white/20 shadow-lg"
                />
              ))}
            </div>
            <div className="text-base leading-relaxed py-1 text-white">
              {(item as ImageNewsItem).content}
            </div>
          </div>
        )}

        {item.type === 'poll' && (
          <div className="py-2">
            <div className="font-medium mb-3 flex items-center gap-2 text-white">
              <BarChart2 className="w-4 h-4 text-white/80" />
              {(item as PollNewsItem).question}
            </div>
            <div className="flex flex-col gap-2">
              {(item as PollNewsItem).options.map(opt => (
                <Button
                  key={opt.id}
                  variant="outline"
                  className="justify-between w-full backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-xl"
                  disabled
                >
                  <span>{opt.text}</span>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {opt.voters.length}
                  </Badge>
                </Button>
              ))}
            </div>
            {item.expiresAt && (
              <div className="text-xs text-white/60 mt-2">
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
                className="flex items-center gap-1 backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-full px-3 py-1"
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
      <div className="flex flex-col min-h-screen w-full relative z-10">
        {/* Header Section */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl mx-2 mt-4 mb-6 p-4 md:p-6 border border-white/10 shadow-2xl ring-1 ring-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                title="Zurück zum Dashboard"
                className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                News Management
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchNews}
              title="Neu laden"
              className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
        {/* News Feed */}
        <div
          ref={feedRef}
          className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32 px-2"
          style={{ scrollBehavior: 'smooth', minHeight: 0 }}
        >
          {loading ? (
            <div className="space-y-4">
              {/* Mixed skeleton types for realistic loading */}
              <NewsSkeletonBubble type="text" />
              <NewsSkeletonBubble type="image" />
              <NewsSkeletonBubble type="poll" />
              <NewsSkeletonBubble type="text" />
              <NewsSkeletonBubble type="image" />
            </div>
          ) : news.length === 0 ? (
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20">
              <div className="text-center text-white/70 text-lg">
                Noch keine News vorhanden. Klicke auf das Refresh-Icon zum Laden.
              </div>
            </div>
          ) : (
            news.map(item => <NewsBubble key={item.id} item={item} />)
          )}
        </div>
        {/* Fixed Bottom Input Bar */}
        <form
          className="fixed bottom-0 left-0 w-full z-30 backdrop-blur-3xl bg-white/10 border-t border-white/20 p-4 shadow-2xl"
          style={{ maxWidth: '100vw' }}
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
              className="w-full backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
              autoFocus
            />
            <div className="flex gap-2 w-full">
              <Button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex-1 backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl bg-primary"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageModal(true)}
                title="Bild-News hinzufügen"
                className="flex-1 backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPollModal(true)}
                title="Umfrage erstellen"
                className="flex-1 backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-white/90 hover:text-white rounded-xl"
              >
                <BarChart2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Bild-News erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={imageContent}
                onChange={e => setImageContent(e.target.value)}
                placeholder="Text zur Bild-News..."
                disabled={imageSending}
                className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
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
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mb-3 backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white/90 hover:text-white rounded-xl"
                  disabled={imageFiles.length >= MAX_IMAGES || imageSending}
                >
                  <label htmlFor="image-upload-input" className="cursor-pointer">
                    {imageFiles.length >= MAX_IMAGES ? 'Maximal 5 Bilder' : 'Bilder auswählen'}
                  </label>
                </Button>
                <div className="flex gap-3 flex-wrap">
                  {imagePreviews.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 border border-white/30 rounded-xl overflow-hidden ring-2 ring-white/20"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={imageSending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={imageSending}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white/90 hover:text-white rounded-xl"
                >
                  Abbrechen
                </Button>
              </DialogClose>
              <Button
                onClick={handleSendImageNews}
                disabled={imageSending || !imageContent.trim() || imageFiles.length === 0}
                className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {imageSending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                Senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showPollModal} onOpenChange={setShowPollModal}>
          <DialogContent className="backdrop-blur-3xl bg-white/10 border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Umfrage erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question" className="text-white/90">
                  Frage
                </Label>
                <Input
                  id="poll-question"
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  placeholder="Stelle deine Frage..."
                  disabled={pollSending}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white/90">Antwortmöglichkeiten</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={e => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      disabled={pollSending}
                      className="backdrop-blur-2xl bg-white/10 border-white/20 placeholder:text-white/60 text-white"
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePollOption(index)}
                        disabled={pollSending}
                        className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-red-500/20 hover:border-red-400/30 transition-all duration-300 text-white/90 hover:text-red-300 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPollOption}
                  disabled={pollSending || pollOptions.length >= 10}
                  className="w-full backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white/90 hover:text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Option hinzufügen
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 backdrop-blur-2xl bg-white/5 rounded-xl border border-white/10">
                <Switch
                  id="multiple-answers"
                  checked={allowMultipleAnswers}
                  onCheckedChange={setAllowMultipleAnswers}
                  disabled={pollSending}
                />
                <Label htmlFor="multiple-answers" className="text-white/90">
                  Mehrfachauswahl erlauben
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poll-expires" className="text-white/90">
                  Ablaufdatum (optional)
                </Label>
                <Input
                  id="poll-expires"
                  type="datetime-local"
                  value={pollExpiresAt}
                  onChange={e => setPollExpiresAt(e.target.value)}
                  disabled={pollSending}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pollSending}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white/90 hover:text-white rounded-xl"
                >
                  Abbrechen
                </Button>
              </DialogClose>
              <Button
                onClick={handleSendPoll}
                disabled={
                  pollSending || !pollQuestion.trim() || pollOptions.some(opt => !opt.trim())
                }
                className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {pollSending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                Umfrage erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NewsManagement;
