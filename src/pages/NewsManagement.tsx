import React, { useState, useRef, useEffect } from 'react';
import { useNewsService } from '@/services/newsService';
import { NewsItem, TextNewsItem, ImageNewsItem, PollNewsItem, PollOption } from '@/models/news';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UserCircle, Image as ImageIcon, BarChart2, RefreshCw, Send, Trash2, ArrowLeft, Plus, X } from 'lucide-react';
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

const NewsBubble: React.FC<{ item: NewsItem }> = ({ item }) => {
  return (
    <Card className="mb-6 w-full shadow-md rounded-2xl border-0 bg-white/90">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {item.authorImageUrl ? (
              <img
                src={item.authorImageUrl}
                alt={item.authorName}
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <UserCircle className="w-8 h-8 text-muted-foreground" />
            )}
            <span className="font-semibold text-sm">{item.authorName || 'Unbekannt'}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: de })}
          </span>
        </div>

        {/* Content */}
        {item.type === 'text' && (
          <div className="text-base leading-relaxed py-2">{(item as TextNewsItem).content}</div>
        )}

        {item.type === 'image' && (
          <div>
            <div className="flex gap-2 py-2">
              {(item as ImageNewsItem).imageUrls.map((url, idx) => (
                <img
                  key={url}
                  src={url}
                  alt={`Bild ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              ))}
            </div>
            <div className="text-base leading-relaxed py-1">{(item as ImageNewsItem).content}</div>
          </div>
        )}

        {item.type === 'poll' && (
          <div className="py-2">
            <div className="font-medium mb-2 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              {(item as PollNewsItem).question}
            </div>
            <div className="flex flex-col gap-2">
              {(item as PollNewsItem).options.map(opt => (
                <Button
                  key={opt.id}
                  variant="outline"
                  className="justify-between w-full"
                  disabled
                >
                  <span>{opt.text}</span>
                  <Badge variant="secondary">{opt.voters.length}</Badge>
                </Button>
              ))}
            </div>
            {item.expiresAt && (
              <div className="text-xs text-muted-foreground mt-1">
                Läuft ab: {new Date(item.expiresAt).toLocaleString('de-DE')}
              </div>
            )}
          </div>
        )}

        {/* Reactions */}
        {item.reactions && item.reactions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {Array.from(new Set(item.reactions.map(r => r.type))).map(type => (
              <Badge key={type} variant="outline" className="flex items-center gap-1">
                <span>{type}</span>
                <span className="text-xs">{item.reactions?.filter(r => r.type === type).length}</span>
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
      setNews(allNews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
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
        authorId
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
            voters: []
          })),
          allowMultipleChoices: allowMultipleAnswers,
          endDate: pollExpiresAt || null,
          votes: null
        }
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
    <div className="flex justify-center w-full">
      <div className="min-w-[600px] max-w-2xl w-full py-8 flex flex-col" style={{height: '90vh'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              title="Zurück zum Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">News Management</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchNews} title="Neu laden">
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <div ref={feedRef} className="flex-1 flex flex-col gap-2 overflow-y-auto pb-4" style={{scrollBehavior: 'smooth'}}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Noch keine News vorhanden. Klicke auf das Refresh-Icon zum Laden.
            </div>
          ) : (
            news.map(item => <NewsBubble key={item.id} item={item} />)
          )}
        </div>
        <form
          className="flex gap-2 mt-2 border-t pt-4 bg-white"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Neue Nachricht schreiben..."
            disabled={sending}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={sending || !input.trim()} size="icon">
            <Send />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowImageModal(true)}
            title="Bild-News hinzufügen"
          >
            <ImageIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowPollModal(true)}
            title="Umfrage erstellen"
          >
            <BarChart2 />
          </Button>
        </form>
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bild-News erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={imageContent}
                onChange={e => setImageContent(e.target.value)}
                placeholder="Text zur Bild-News..."
                disabled={imageSending}
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
                <Button asChild variant="outline" size="sm" className="mb-2" disabled={imageFiles.length >= MAX_IMAGES || imageSending}>
                  <label htmlFor="image-upload-input" className="cursor-pointer">
                    {imageFiles.length >= MAX_IMAGES ? 'Maximal 5 Bilder' : 'Bilder auswählen'}
                  </label>
                </Button>
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 border rounded-md overflow-hidden">
                      <img src={url} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={imageSending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={imageSending}>
                  Abbrechen
                </Button>
              </DialogClose>
              <Button onClick={handleSendImageNews} disabled={imageSending || !imageContent.trim() || imageFiles.length === 0}>
                {imageSending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                Senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showPollModal} onOpenChange={setShowPollModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Umfrage erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question">Frage</Label>
                <Input
                  id="poll-question"
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  placeholder="Stelle deine Frage..."
                  disabled={pollSending}
                />
              </div>

              <div className="space-y-2">
                <Label>Antwortmöglichkeiten</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={e => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      disabled={pollSending}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePollOption(index)}
                        disabled={pollSending}
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
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Option hinzufügen
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="multiple-answers"
                  checked={allowMultipleAnswers}
                  onCheckedChange={setAllowMultipleAnswers}
                  disabled={pollSending}
                />
                <Label htmlFor="multiple-answers">Mehrfachauswahl erlauben</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poll-expires">Ablaufdatum (optional)</Label>
                <Input
                  id="poll-expires"
                  type="datetime-local"
                  value={pollExpiresAt}
                  onChange={e => setPollExpiresAt(e.target.value)}
                  disabled={pollSending}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pollSending}>
                  Abbrechen
                </Button>
              </DialogClose>
              <Button
                onClick={handleSendPoll}
                disabled={
                  pollSending ||
                  !pollQuestion.trim() ||
                  pollOptions.some(opt => !opt.trim())
                }
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
