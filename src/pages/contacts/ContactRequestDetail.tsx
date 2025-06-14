import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle2, MessageSquare, User, RefreshCcw, Send } from 'lucide-react';
import { ContactRequest, ContactRequestType, ContactMessage } from '@/models/contact-requests';
import { useContactService } from '@/services/contactService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export function ContactRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contactRequest, setContactRequest] = useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const contactService = useContactService();

  const fetchContactRequest = useCallback(async () => {
    if (!id) return;
    try {
      setIsRefreshing(true);
      const request = await contactService.getContactRequestById(id);
      setContactRequest(request);
      toast.success('Kontaktanfrage erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Laden der Kontaktanfrage:', error);
      toast.error('Fehler beim Laden der Kontaktanfrage');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [id, contactService]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !responseMessage.trim()) return;

    try {
      setIsSending(true);
      await contactService.respondToContactRequest(id, responseMessage.trim());
      setResponseMessage('');
      await fetchContactRequest(); // Aktualisiere die Konversation
      toast.success('Antwort erfolgreich gesendet');
    } catch (error) {
      console.error('Fehler beim Senden der Antwort:', error);
      toast.error('Fehler beim Senden der Antwort');
    } finally {
      setIsSending(false);
    }
  };

  // Initiale Ladung der Daten
  useEffect(() => {
    fetchContactRequest();
  }, []); // Leeres Dependency Array für einmalige Ausführung

  const getRequestTypeBadge = (type: ContactRequestType) => {
    const typeConfig = {
      [ContactRequestType.GENERAL]: { label: 'Allgemein', variant: 'default' },
      [ContactRequestType.FEEDBACK]: { label: 'Feedback', variant: 'secondary' },
      [ContactRequestType.BUSINESS_CLAIM]: { label: 'Geschäft beanspruchen', variant: 'destructive' },
      [ContactRequestType.BUSINESS_REQUEST]: { label: 'Geschäftsanfrage', variant: 'outline' }
    };

    const config = typeConfig[type];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (request: ContactRequest) => {
    if (request.isProcessed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Bearbeitet
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
        <Clock className="mr-1 h-3 w-3" />
        Offen
      </Badge>
    );
  };

  const MessageBubble = ({ message }: { message: ContactMessage }) => {
    const isAdmin = message.isAdminResponse;
    return (
      <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <div className="flex items-center space-x-2 mb-1">
            <User className={`h-4 w-4 ${isAdmin ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${isAdmin ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {isAdmin ? 'Admin' : 'Benutzer'}
            </span>
          </div>
          <p className="text-sm">{message.message}</p>
          <div className={`text-xs mt-1 ${isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white p-4 md:p-8">
        <div className="text-center py-8">Lade Kontaktanfrage...</div>
      </div>
    );
  }

  if (!contactRequest) {
    return (
      <div className="w-full min-h-screen bg-white p-4 md:p-8">
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Kontaktanfrage nicht gefunden</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Die angeforderte Kontaktanfrage konnte nicht gefunden werden.
          </p>
          <Button
            onClick={() => navigate('/contacts')}
            variant="outline"
            className="mt-4"
          >
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col p-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1 p-0">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-4 pt-4 pb-2 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/contacts')}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">Kontaktanfrage Details</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {getRequestTypeBadge(contactRequest.type)}
                {getStatusBadge(contactRequest)}
                <span className="text-xs md:text-sm text-muted-foreground">
                  {format(new Date(contactRequest.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={fetchContactRequest}
            variant="outline"
            disabled={isRefreshing}
            className="flex items-center w-full md:w-auto"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Wird aktualisiert...' : 'Aktualisieren'}
          </Button>
        </div>

        {/* Konversation */}
        <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-40 pt-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="font-semibold text-base mb-2 px-2">Konversation</div>
            <div className="space-y-4">
              {contactRequest.messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Antwortfeld */}
        <form
          onSubmit={handleSubmitResponse}
          className="fixed bottom-0 left-0 w-full z-30 bg-white border-t shadow-lg px-2 py-3 flex flex-col gap-2"
          style={{maxWidth: '100vw'}}
        >
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-2">
            <Textarea
              placeholder="Ihre Antwort..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-[60px]"
              disabled={isSending}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSending || !responseMessage.trim()}
                className="flex items-center"
              >
                <Send className={`mr-2 h-4 w-4 ${isSending ? 'animate-pulse' : ''}`} />
                {isSending ? 'Wird gesendet...' : 'Antwort senden'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 